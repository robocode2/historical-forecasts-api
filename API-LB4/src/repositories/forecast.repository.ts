import {Getter, inject, injectable} from '@loopback/core';
import {BelongsToAccessor, BelongsToDefinition, createBelongsToAccessor, DefaultTransactionalRepository} from '@loopback/repository';
import { ScrapyAppDb } from '../datasources';
import {City, Forecast, ForecastRelations, Country} from '../models';
import { Base } from './keys';
import { BaseCityRepository } from './city.repository';
import { Source } from '../models/source.model';
import { BaseCountryRepository } from './country.repository';
import { BaseSourceRepository } from './source.repository';

@injectable({ tags: { key: Base.Repository.FORECAST } })
export class BaseForecastRepository extends DefaultTransactionalRepository<
  Forecast,
  typeof Forecast.prototype.id,
  ForecastRelations
> {

  public readonly city: BelongsToAccessor<City, typeof City.prototype.id>;
  public readonly country: BelongsToAccessor<Country, typeof Country.prototype.id>;
  public readonly source: BelongsToAccessor<Source, typeof Source.prototype.id>;


  constructor(
    @inject('datasources.ScrapyApp') dataSource: ScrapyAppDb,
    @inject.getter(Base.Repository.CITY) cityRepositoryGetter: Getter<BaseCityRepository>,
    @inject.getter(Base.Repository.COUNTRY) countryRepositoryGetter: Getter<BaseCountryRepository>,
    @inject.getter(Base.Repository.FORECAST) sourceRepositoryGetter: Getter<BaseSourceRepository>

  ) {
    super(Forecast, dataSource);

    const cityMeta = this.entityClass.definition.relations['city'];
    this.city = createBelongsToAccessor(cityMeta as BelongsToDefinition, cityRepositoryGetter, this);
    this.registerInclusionResolver('city', this.city.inclusionResolver);

    const countryMeta = this.entityClass.definition.relations['country'];
    this.country = createBelongsToAccessor(countryMeta as BelongsToDefinition, countryRepositoryGetter, this);
    this.registerInclusionResolver('country', this.country.inclusionResolver);

    const sourceMeta = this.entityClass.definition.relations['source'];
    this.source = createBelongsToAccessor(sourceMeta as BelongsToDefinition, sourceRepositoryGetter, this);
    this.registerInclusionResolver('source', this.source.inclusionResolver);
    
  }
}
