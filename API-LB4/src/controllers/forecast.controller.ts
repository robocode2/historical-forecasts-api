import {inject, injectable} from '@loopback/core';
import {get, param, HttpErrors, Response, RestBindings} from '@loopback/rest';
import {BaseCityRepository} from '../repositories/city.repository';
import {BaseCountryRepository} from '../repositories/country.repository';
import {BaseSourceRepository} from '../repositories/source.repository';
import {BaseForecastRepository} from '../repositories/forecast.repository';
import {City, Country, Forecast, Source} from '../models';
import {Filter, Where} from '@loopback/repository';
import { Base } from '../repositories/keys';
import { Util } from '../services/keys';
import { DataService } from '../services/DataService';

@injectable({tags: {name: 'ForecastController'}})
export class ForecastController {
  constructor(
    @inject(Base.Repository.CITY) private cityRepository: BaseCityRepository,
    @inject(Base.Repository.COUNTRY) private countryRepository: BaseCountryRepository,
    @inject(Base.Repository.SOURCE) private sourceRepository: BaseSourceRepository,
    @inject(Base.Repository.FORECAST) private forecastRepository: BaseForecastRepository,
    @inject(Util.Service.DATA) private dataService: DataService,
  ) {}


  @get('/collection-dates', {
    responses: {
      '200': {
        description: 'List of unique collection dates',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'string',
                format: 'date',
              },
            },
          },
        },
      },
    },
  })
  async getCollectionDates(): Promise<string[]> {
    const forecasts = await this.forecastRepository.find({
      fields: {collection_date: true},
    });
  
    const uniqueDates = Array.from(
      new Set(forecasts.map(forecast => forecast.collection_date.toISOString().split('T')[0]))
    );
  
    uniqueDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
    return uniqueDates;
  }
  

  @get('/cities')
  async getCities(
    @param.filter(City) filter?: Filter<City>,
  ): Promise<City[]> {
    return this.cityRepository.find(filter);
  }

  @get('/countries')
  async getCountries(
    @param.filter(Country) filter?: Filter<Country>,
  ): Promise<Country[]> {
    return this.countryRepository.find(filter);
  }

  @get('/sources')
  async getSources(
    @param.filter(Source) filter?: Filter<Source>,
  ): Promise<Source[]> {
    return this.sourceRepository.find(filter);
  }


    @get('/forecasts', {
      responses: {
        '200': {
          description: 'Array of Forecasts grouped by City and Country',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cities: {
                    type: 'array',
                    items: {type: 'object', additionalProperties: true},
                  },
                  forecasts: {
                    type: 'array',
                    items: {type: 'object', additionalProperties: true},
                  },
                  csvFile: {type: 'string'},
                },
              },
            },
          },
        },
      },
    })
    async getForecasts(
      @inject(RestBindings.Http.RESPONSE) res: Response,
      @param.query.string('city') cityNamesStr: string,
      @param.query.string('country') countryName: string,
      @param.query.string('source') sourceName: string,
      @param.query.string('startDate') startDate?: string,
      @param.query.string('endDate') endDate?: string,
    ): Promise<void> {
      try {
        this.validateDate(startDate, 'startDate');
        this.validateDate(endDate, 'endDate');
        this.validateDateRange(startDate, endDate);
    
        const cityNames = cityNamesStr ? cityNamesStr.split(',') : [];
        const cityIds = await this.getCityIds(cityNames);
        const countryId = await this.getEntityId(countryName, this.countryRepository, 'Country');
        const sourceId = await this.getEntityId(sourceName, this.sourceRepository, 'Source');
    
        const where = this.buildForecastFilter(cityIds, countryId, sourceId, startDate, endDate);
    
        const forecasts = await this.forecastRepository.find({
          where,
          include: [
            {relation: 'city', scope: {include: [{relation: 'country'}]}},
            {relation: 'country'},
          ],
        });
    
        if (forecasts.length === 0) {
          res.status(404).send({error: 'No forecasts found for the specified criteria.'});
          return;
        }
    
        await this.dataService.generateAndSendCSV(res, forecasts);
      } catch (error) {
        this.handleErrors(res, error);
      }
    }
    
    private validateDate(date: string | undefined, fieldName: string): void {
      if (date && isNaN(Date.parse(date))) {
        throw new HttpErrors.BadRequest(`Invalid ${fieldName} format.`);
      }
    }
    
    private validateDateRange(startDate?: string, endDate?: string): void {
      if (startDate && endDate && startDate > endDate) {
        throw new HttpErrors.BadRequest('startDate cannot be after endDate.');
      }
    }
    
    private async getCityIds(cityNames: string[]): Promise<number[]> {
      if (!cityNames.length) return [];
      const cities = await this.cityRepository.find({
        where: {name: {inq: cityNames}},
        include: [{relation: 'country'}],
      });
    
      if (!cities.length) {
        throw new HttpErrors.NotFound('City not found.');
      }
    
      const foundCityNames = cities.map(city => city.name);
      const notFoundCities = cityNames.filter(city => !foundCityNames.includes(city));
    
      if (notFoundCities.length) {
        console.warn(`Cities not found: ${notFoundCities.join(', ')}`);
      }
    
      return cities.map(city => city.id);
    }
    
    private async getEntityId(
      name: string | undefined,
      repository: typeof this.countryRepository | typeof this.sourceRepository,
      entityType: string,
    ): Promise<number | undefined> {
      if (!name) return undefined;
    
      const entity = await repository.findOne({where: {name}});
      if (!entity) {
        throw new HttpErrors.NotFound(`${entityType} not found.`);
      }
    
      return entity.id;
    }
    
    private buildForecastFilter(
      cityIds: number[],
      countryId: number | undefined,
      sourceId: number | undefined,
      startDate?: string,
      endDate?: string,
    ): Where<Forecast> {
      const where: Where<Forecast> = {};
    
      if (cityIds.length) {
        where.cityId = {inq: cityIds};
      }
      if (sourceId) {
        where.sourceId = sourceId;
      }
      if (countryId) {
        where.countryId = countryId;
      }
      if (startDate || endDate) {
        where.forecasted_day = {
          ...(startDate ? {gte: new Date(startDate)} : {}),
          ...(endDate ? {lte: new Date(endDate)} : {}),
        };
      }

      if (startDate && endDate) {
        const start = new Date(endDate);
        const end = new Date(startDate);
        where.forecasted_day = {
          between: [end, start],
        };
      }
    
      return where;
    }
    
    private handleErrors(res: Response, error: Error): void {
      if (error instanceof HttpErrors.HttpError) {
        res.status(error.statusCode).send({error: error.message});
      } else {
        console.error(error);
        res.status(500).send({error: 'Internal Server Error'});
      }
    }
}
