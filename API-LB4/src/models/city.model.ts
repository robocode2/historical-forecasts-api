import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import { Forecast, ForecastWithRelations } from './forecast.model';
import { Country, CountryWithRelations } from './country.model';


@model({
  settings: {strict: true, postgresql: {table: 'city'}},
})
export class City extends Entity {
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
  name: string;


  @hasMany(() => Forecast, {keyTo: 'city_id'})
  forecasts?: Forecast[];


  @belongsTo(
    () => Country,
    {},
    {
      name: 'country_id',
      required: true
    },
  )
  countryId: number;


  constructor(data?: Partial<City>) {
    super(data);
  }
}

export interface CityRelations {
  // describe navigational properties here
  forecasts?: ForecastWithRelations[];
  country?: CountryWithRelations; // TODO double check if optional 

}
export type CityWithRelations = City & CityRelations;

