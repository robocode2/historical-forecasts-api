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

  }





