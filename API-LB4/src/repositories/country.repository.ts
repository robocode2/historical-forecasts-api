import {Getter, inject, injectable} from '@loopback/core';
import {DefaultTransactionalRepository, Filter, HasManyDefinition, HasManyRepositoryFactory, createHasManyRepositoryFactory} from '@loopback/repository';
import {ScrapyAppDb} from '../datasources';
import {Country, Forecast, CountryRelations, City} from '../models';
import {BaseForecastRepository} from './forecast.repository';
import {Base} from './keys';
import { BaseCityRepository } from './city.repository';

@injectable({tags: {key: Base.Repository.COUNTRY}})
export class BaseCountryRepository extends DefaultTransactionalRepository<
  Country,
  typeof Country.prototype.id,
  CountryRelations
> {

  public readonly forecasts: HasManyRepositoryFactory<Forecast, typeof Forecast.prototype.id>;
  public readonly cities: HasManyRepositoryFactory<City, typeof City.prototype.id>;


  constructor(
    @inject('datasources.ScrapyApp') dataSource: ScrapyAppDb,
    @inject.getter(Base.Repository.FORECAST) forecastRepositoryGetter: Getter<BaseForecastRepository>,
    @inject.getter(Base.Repository.CITY) cityRepositoryGetter: Getter<BaseCityRepository>,
  ) {
    super(Country, dataSource);

    const forecastsMeta = this.entityClass.definition.relations['forecasts'];
    this.forecasts = createHasManyRepositoryFactory(
      forecastsMeta as HasManyDefinition,
      forecastRepositoryGetter
    );
    this.registerInclusionResolver('forecasts', this.forecasts.inclusionResolver);

    const citiesMeta = this.entityClass.definition.relations['cities'];
    this.cities = createHasManyRepositoryFactory(
      citiesMeta as HasManyDefinition,
      cityRepositoryGetter
    );
    this.registerInclusionResolver('cities', this.cities.inclusionResolver);


  }

  async searchByName(name: string): Promise<Country[]> {
    // Use parameterized query to prevent SQL injection
    const filter: Filter<Country> = {
      where: {
        name: {like: `%${name}%`}
      }
    };
    return this.find(filter);
  }


}
