import {belongsTo, Entity, model, property} from '@loopback/repository';
import {City, CityWithRelations as CityWithRelations} from './city.model';
import {Country, CountryWithRelations as CountryWithRelations} from './country.model';
import { SourceWithRelations } from './source.model';

@model({
  settings: {strict: true, postgresql: {table: 'forecast'}},
})
export class Forecast extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'date',
    required: true,
  })
  day: Date;

  @property({
    type: 'date',
    required: true,
  })
  date: Date;

  @property({
    type: 'string',
    required: false, // TODOX false but no question mark ?
  })
  weather_condition?: string;

  @property({
    type: 'number',
    required: true,
  })
  temp_high: number;

  @property({
    type: 'number',
    required: true,
  })
  temp_low: number;

  @property({
    type: 'number',
    required: false,
  })
  wind_speed?: number;

  @property({
    type: 'number',
    required: false,
  })
  humidity?: number;

  @property({
    type: 'number',
    required: false,
  })
  precipitation_chance?: number; 

  @property({
    type: 'number',
    required: false,
  })
  precipitation_amount?: number;


  @property({
    type: 'string',
    required: false,
  })
  state?: string;

  @belongsTo(
    () => City,
    {},
    {
      name: 'city_id',
      required: true
    },
  )
  cityId: number;

  @belongsTo(
    () => Country,
    {},
    {
      name: 'country_id',
      required: true
    },
  )
  countryId: number;

  @belongsTo(
    () => Country,
    {},
    {
      name: 'source_id',
      required: true
    },
  )
  sourceId: number;

  constructor(data?: Partial<Forecast>) {
    super(data);
  }
}
export interface ForecastRelations {
  // describe navigational properties here
  city?: CityWithRelations;
  country?: CountryWithRelations;
  source?: SourceWithRelations;

}
export type ForecastWithRelations = Forecast & ForecastRelations;


