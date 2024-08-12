import {Entity, hasMany, model, property} from '@loopback/repository';
import {Forecast, ForecastWithRelations as ForecastWithRelations} from './forecast.model';

@model({
  settings: {strict: true, postgresql: {table: 'source'}},
})
export class Source extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    updateOnly: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  name?: string;


  @hasMany(() => Forecast, {keyTo: 'source_id'})
  forecasts?: Forecast[];


  constructor(data?: Partial<Source>) {
    super(data);
  }
}

export interface SourceRelations {
  // describe navigational properties here
  forecasts?: ForecastWithRelations[];

}
export type SourceWithRelations = Source & SourceRelations;


