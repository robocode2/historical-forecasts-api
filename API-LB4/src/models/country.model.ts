import {Entity, hasMany, model, property} from '@loopback/repository';
import {Forecast, ForecastWithRelations} from './forecast.model';
import { City, CityWithRelations } from './city.model';

@model({
  settings: {strict: true, postgresql: {table: 'country'}},
})
export class Country extends Entity {
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


  @hasMany(() => Forecast, {keyTo: 'country_id'})
  forecasts?: Forecast[];

  @hasMany(() => Forecast, {keyTo: 'country_id'})
  cities?: City[];


  constructor(data?: Partial<Country>) {
    super(data);
  }
}

export interface CountryRelations {
  // describe navigational properties here
  forecasts?: ForecastWithRelations[];
  cities?: CityWithRelations[];

}
export type CountryWithRelations = Country & CountryRelations;


