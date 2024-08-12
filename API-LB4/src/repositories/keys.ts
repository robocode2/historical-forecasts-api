import { BindingKey } from "@loopback/core";
import { BaseCityRepository } from "./city.repository";
import { BaseForecastRepository } from "./forecast.repository";
import { BaseCountryRepository } from "./country.repository";
import { BaseSourceRepository } from "./source.repository";

export namespace Base {
    export namespace Repository {
      export const CITY = BindingKey.create<BaseCityRepository>('base.repositories.city');
      export const COUNTRY = BindingKey.create<BaseCountryRepository>('base.repositories.country');
      export const SOURCE = BindingKey.create<BaseSourceRepository>('base.repositories.source');
      export const FORECAST = BindingKey.create<BaseForecastRepository>('base.repositories.forecast');

    }
}