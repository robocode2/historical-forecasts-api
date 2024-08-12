import {Getter, inject, injectable} from '@loopback/core';
import {BelongsToAccessor, BelongsToDefinition, DefaultTransactionalRepository, Filter, HasManyDefinition, HasManyRepositoryFactory, createBelongsToAccessor, createHasManyRepositoryFactory} from '@loopback/repository';
import {ScrapyAppDb} from '../datasources';
import {City, Forecast, CityRelations, Country} from '../models';
import {BaseForecastRepository} from './forecast.repository';
import {Base} from './keys';
import { BaseCountryRepository } from './country.repository';

@injectable({tags: {key: Base.Repository.CITY}})
export class BaseCityRepository extends DefaultTransactionalRepository<
  City,
  typeof City.prototype.id,
  CityRelations
> {

  public readonly forecasts: HasManyRepositoryFactory<Forecast, typeof Forecast.prototype.id>;
  public readonly country: BelongsToAccessor<Country, typeof Country.prototype.id>;


  constructor(
    @inject('datasources.ScrapyApp') dataSource: ScrapyAppDb,
    @inject.getter(Base.Repository.FORECAST) forecastRepositoryGetter: Getter<BaseForecastRepository>,
    @inject.getter(Base.Repository.COUNTRY) countryRepositoryGetter: Getter<BaseCountryRepository>,

  ) {
    super(City, dataSource);

    const forecastsMeta = this.entityClass.definition.relations['forecasts'];
    this.forecasts = createHasManyRepositoryFactory(
      forecastsMeta as HasManyDefinition,
      forecastRepositoryGetter
    );
    this.registerInclusionResolver('forecasts', this.forecasts.inclusionResolver);

    const countryMeta = this.entityClass.definition.relations['country'];
    this.country = createBelongsToAccessor(countryMeta as BelongsToDefinition, countryRepositoryGetter, this);
    this.registerInclusionResolver('country', this.country.inclusionResolver);

  }

  async searchByName(name: string): Promise<City[]> { // TODO either use or remove
    // Use parameterized query to prevent SQL injection
    const filter: Filter<City> = {
      where: {
        name: {like: `%${name}%`}
      }
    };
    return this.find(filter);
  }


}
