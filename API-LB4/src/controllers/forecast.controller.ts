import {inject, injectable} from '@loopback/core';
import {get, param, HttpErrors, Response, RestBindings} from '@loopback/rest';
import {BaseCityRepository} from '../repositories/city.repository';
import {BaseCountryRepository} from '../repositories/country.repository';
import {BaseSourceRepository} from '../repositories/source.repository';
import {BaseForecastRepository} from '../repositories/forecast.repository';
import {City, Country, Forecast, Source} from '../models';
import {Filter, Where} from '@loopback/repository';
import * as path from 'path';
import * as csvWriter from 'csv-writer';
import { Base } from '../repositories/keys';
import fs from 'fs';
import { parse } from 'csv-parse';

@injectable({tags: {name: 'ForecastController'}})
export class ForecastController {
  constructor(
    @inject(Base.Repository.CITY) private cityRepository: BaseCityRepository,
    @inject(Base.Repository.COUNTRY) private countryRepository: BaseCountryRepository,
    @inject(Base.Repository.SOURCE) private sourceRepository: BaseSourceRepository,
    @inject(Base.Repository.FORECAST) private forecastRepository: BaseForecastRepository,
  ) {}


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
    let cityIds: number[] = [];
  
    const cityNames = cityNamesStr ? cityNamesStr.split(',') : [];
  
    if (cityNames.length > 0) {
      const cities = await this.cityRepository.find({
        where: {
          name: {inq: cityNames}
        },
        include: [{relation: 'country'}]

      });
  
      if (cities.length === 0) {
        throw new HttpErrors.NotFound(`No cities found for the provided names: ${cityNames.join(', ')}`);
      }
  
      cityIds = cities.map(city => city.id);
    }
  
    let countryId: number | undefined;
    if (countryName) {
      const country = await this.countryRepository.findOne({where: {name: countryName}});
      if (!country) throw new HttpErrors.NotFound(`Country not found: ${countryName}`);
      countryId = country.id;
    } 
  
    let sourceId: number | undefined;
    if (sourceName) {
      const source = await this.sourceRepository.findOne({where: {name: sourceName}});
      if (!source) throw new HttpErrors.NotFound(`Source not found: ${sourceName}`);
      sourceId = source.id;
    } 
  
    if (countryId) {
      const countryCities = await this.cityRepository.find({where: {countryId}});
      const countryCityIds = countryCities.map(city => city.id);
      cityIds = [...new Set([...cityIds, ...countryCityIds])];
    } 
  
    const where: Where<Forecast> = {};
  
    if (cityIds.length > 0) {
      where.cityId = {inq: cityIds};
    }
  
    if (sourceId) {
      where.sourceId = sourceId;
    } 
  
    if (startDate || endDate) {
      where.day = {
        ...(startDate ? {gte: new Date(startDate)} : {}),
        ...(endDate ? {lte: new Date(endDate)} : {}),
      };
    } 

    if (startDate && endDate) {
      const start = new Date(endDate);
      const end = new Date(startDate);
      
      where.day = {
        between: [end, start]
      };
    }
  
    const forecasts = await this.forecastRepository.find({where});
 
    await this.generateAndSendCSV(res, forecasts);
  
  }


private async generateAndSendCSV(res: Response, forecasts: Forecast[]): Promise<void> {
    const groupedData = await this.groupDataByCityCountrySource(forecasts);
    const csvPath = await this.saveGroupedDataAsCSV(groupedData);
    if (fs.existsSync(csvPath)) {
      const stats = fs.statSync(csvPath);
  
      if (stats.size > 0) {
        res.setHeader('Content-Disposition', 'attachment; filename=forecasts.csv');
        res.setHeader('Content-Type', 'text/csv');
  
        try {
          const csvData = await this.createReadStream(csvPath);
  
          if (csvData.length > 0) {
            res.write(csvData.join('\n'));
            res.end();
  
            fs.unlink(csvPath, (err) => {
              if (err) {
                console.error('Error deleting file:', err);
              } else {
                console.log('CSV file deleted successfully');
              }
            });
          } else {
            res.status(404).send('CSV file is empty');
          }
        } catch (error) {
          console.error('Error reading file:', error);
          res.status(500).send('Internal Server Error');
        }
      } else {
        res.status(404).send('CSV file is empty');
      }
    } else {
      res.status(404).send('CSV file not found');
    }
  }
  
   private async createReadStream(filePath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const csvData: string[] = [];
      fs.createReadStream(filePath)
        .pipe(parse({ delimiter: ',', from_line: 1 }))
        .on('data', (row) => {
          csvData.push(row.join(',')); 
        })
        .on('end', () => resolve(csvData))
        .on('error', (error) => reject(error));
    });
  }


  
  private async groupDataByCityCountrySource(forecasts: Forecast[]) {
    const groupedData = {
      cities: [] as City[],
      forecasts: [] as Forecast[],
      sources: [] as Source[], 
    };
  
    const cityMap = new Map<number, City>();
    const countryMap = new Map<number, Country>();
    const sourceMap = new Map<number, Source>();
  
    const cityIds = [...new Set(forecasts.map(f => f.cityId))];
    const countryIds = [...new Set(forecasts.map(f => f.countryId))];
    const sourceIds = [...new Set(forecasts.map(f => f.sourceId))];
  
    const cities = await Promise.all(cityIds.map(id => this.cityRepository.findById(id)));
    const countries = await Promise.all(countryIds.map(id => this.countryRepository.findById(id)));
    const sources = await Promise.all(sourceIds.map(id => this.sourceRepository.findById(id)));
  
    cities.forEach(city => cityMap.set(city.id, city));
    countries.forEach(country => countryMap.set(country.id, country));
    sources.forEach(source => sourceMap.set(source.id, source));
  
    for (const forecast of forecasts) {
      groupedData.cities.push(cityMap.get(forecast.cityId)!);
      groupedData.forecasts.push(forecast);
      groupedData.sources = Array.from(sourceMap.values()); 
    }
  
    return groupedData;
  }

  private saveGroupedDataAsCSV(groupedData: any): Promise<string> {
    const outputPath = path.join(__dirname, 'forecasts.csv');
    const csvWriterInstance = csvWriter.createObjectCsvWriter({
      path: outputPath,
      header: [
        { id: 'source', title: 'source' },
        { id: 'city', title: 'city' },
        { id: 'state', title: 'State' },
        { id: 'day', title: 'day' },
        { id: 'date', title: 'date' },
        { id: 'temp_high', title: 'temp_high' },
        { id: 'temp_low', title: 'temp_low' },
        { id: 'wind', title: 'wind' },
        { id: 'precipitation', title: 'precipitation' },
        { id: 'weather_condition', title: 'weather_condition' },
      ],
    });
  
    const groupedBySourceAndCity: { [key: string]: any[] } = {};
  
    for (const forecast of groupedData.forecasts) {
      const city = groupedData.cities.find((c: City) => c.id === forecast.cityId);
      const source = groupedData.sources.find((s: Source) => s.id === forecast.sourceId);
  
      if (city && source) {
        const sourceCityKey = `${source.name}-${city.name}`;
  
        if (!groupedBySourceAndCity[sourceCityKey]) {
          groupedBySourceAndCity[sourceCityKey] = [];
        }
  
        const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      };

        groupedBySourceAndCity[sourceCityKey].push({
          source: source.name,
          city: city.name,
          // country: city.country.name,
          state: forecast.state,
          day: formatDate(forecast.day),
          date: formatDate(forecast.date),
          temp_high: forecast.temp_high,
          temp_low: forecast.temp_low,
          wind: forecast.wind,
          precipitation: forecast.precipitation,
          weather_condition: ' " ' + forecast.weather_condition + ' " ',
        });
      }
    }
  
  const records = Object.values(groupedBySourceAndCity).flat();

  return new Promise<string>((resolve, reject) => {
    csvWriterInstance.writeRecords(records)
      .then(() => {
        console.log('CSV file has been written successfully');
        resolve(outputPath);
      })
      .catch((err: any) => {
        console.error('Error writing CSV file:', err);
        reject(err);
      });
  });
  }





}
