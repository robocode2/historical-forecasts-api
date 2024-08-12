import {Getter, inject, injectable} from '@loopback/core';
import {DefaultTransactionalRepository, Filter, HasManyDefinition, HasManyRepositoryFactory, createHasManyRepositoryFactory} from '@loopback/repository';
import {ScrapyAppDb} from '../datasources';
import {Country, Forecast} from '../models';
import {BaseForecastRepository} from './forecast.repository';
import {Base} from './keys';
import { Source, SourceRelations } from '../models/source.model';

@injectable({tags: {key: Base.Repository.SOURCE}})
export class BaseSourceRepository extends DefaultTransactionalRepository<
  Source,
  typeof Source.prototype.id,
  SourceRelations
> {

  public readonly forecasts: HasManyRepositoryFactory<Forecast, typeof Forecast.prototype.id>;

  constructor(
    @inject('datasources.ScrapyApp') dataSource: ScrapyAppDb,
    @inject.getter(Base.Repository.FORECAST) forecastRepositoryGetter: Getter<BaseForecastRepository>,
  ) {
    super(Source, dataSource);

    const forecastsMeta = this.entityClass.definition.relations['forecasts'];
    this.forecasts = createHasManyRepositoryFactory(
      forecastsMeta as HasManyDefinition,
      forecastRepositoryGetter
    );
    this.registerInclusionResolver('forecasts', this.forecasts.inclusionResolver);

  }

  async searchByName(name: string): Promise<Source[]> {
    // Use parameterized query to prevent SQL injection
    const filter: Filter<Source> = {
      where: {
        name: {like: `%${name}%`}
      }
    };
    return this.find(filter);
  }


}
