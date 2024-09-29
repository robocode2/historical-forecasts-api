

import {BaseCityRepository} from '../../../repositories';
import {Base} from '../../../repositories/keys';
import {ExpressServer} from '../../../server';
import {setupApplication} from '../../helpers';
import {Client, expect} from '../../helpers/test-modules';

describe('ForecastController', () => {
  let server: ExpressServer;
  let client: Client;
  let baseCityRepository: BaseCityRepository;


  before('setupApplication', async () => {
    ({server, client} = await setupApplication());
  });

  after(async () => {
    await server.stop();
  });

  beforeEach(async () => {
    baseCityRepository = await server.lbApp.get(Base.Repository.CITY);
  });


  describe('GET /forecasts?city={}', () => {
    it('should successfully return forecasts for one city', async () => {
      const cityName = 'Tokyo';
      const response = await client
        .get(`/forecasts?city=${cityName}`) // TODOX I need to deploy now ?!

      const city = await baseCityRepository.searchByName(cityName);

      expect(response.status).to.equal(200);
      expect(response.text.split('\n')[0]).to.equal('source,city,country,state,date,day,temp_high,temp_low,wind_speed,humidity,precipitation_chance,precipitation_amount,weather_condition');
      expect(response.headers['content-type']).to.equal('text/csv');
      const rows = response.text.trim().split('\n').slice(1); 
      rows.forEach(row => {
          const columns = row.split(',');
          expect(columns[1].trim()).to.equal(cityName);
          expect(columns[2].trim()).to.equal(city?.country?.name);

      });
    });

    it('should successfully return forecasts for more than one city', async () => {
      const cityNames = ['Tokyo', 'Berlin', 'Tofo'];
      const response = await client
        .get(`/forecasts?city=${cityNames}`) 

      const cities = await baseCityRepository.searchByNames(cityNames);

      expect(response.status).to.equal(200);
      expect(response.text.split('\n')[0]).to.equal('source,city,country,state,date,day,temp_high,temp_low,wind_speed,humidity,precipitation_chance,precipitation_amount,weather_condition');
      expect(response.headers['content-type']).to.equal('text/csv');
      const rows = response.text.trim().split('\n').slice(1); 

      const cityCountryMap = new Map<string, string>();
      cities?.forEach(city => {
        if (city.country) {
          cityCountryMap.set(city.name, city.country?.name!);
        }
      });

      rows.forEach(row => {
        const columns = row.split(',');
        const cityName = columns[1].trim();
        expect(cityCountryMap.has(cityName)).to.be.true;
        expect(columns[2].trim()).to.equal(cityCountryMap.get(cityName));
      });
    });

    it('should return a Not Found Error for an invalid city', async () => {
      const invalidCity = 'invalidCity';
      const response = await client
        .get(`/forecasts?city=${invalidCity}`) 

      expect(response.status).to.equal(404);
      expect(response.text).to.include('NotFoundError: City not found');
    });

    it('should successfully return forecasts for more than one city and a warning for not existing ones', async () => {
      const validCities = ['Tokyo', 'Berlin', 'Tofo'];
      const responseValid = await client
        .get(`/forecasts?city=${validCities}`) 
      
      const citiesWithInvalid = ['Tokyo', 'Berlin', 'Tofo', 'NotExistingCities'];
      const responseWithInvalidCity = await client
        .get(`/forecasts?city=${citiesWithInvalid}`) 

      expect(responseValid.status).to.equal(200);
      expect(responseWithInvalidCity.status).to.equal(200);

      expect(responseWithInvalidCity.headers['x-warning']).to.include('Cities not found: NotExistingCities');

      const rows1 = responseValid.text.trim().split('\n').slice(1); 
      const rows2 = responseWithInvalidCity.text.trim().split('\n').slice(1); 

      expect(rows1.length).to.be.equal(rows2.length);
    });


  });

  describe('GET /forecasts?country={}', () => {
    it('should successfully return forecasts within specific country', async () => {
      const country = 'Spain';
      const response = await client
        .get(`/forecasts?country=${country}`)

      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.equal('text/csv');
      const rows = response.text.trim().split('\n').slice(1); 
      rows.forEach(row => {
          const columns = row.split(',');
          expect(columns[2].trim()).to.equal(country);
      });
    });

    it('should return an error for an invalid country', async () => {
      const invalidCountry = 'invalidCountry';
      const response = await client
        .get(`/forecasts?country=${invalidCountry}`) 

      expect(response.status).to.equal(404);
      expect(response.text).to.include('NotFoundError: Country not found');
    });
  });

  describe('GET /forecasts?source={}', () => {
    it('should successfully return forecasts from one specific source', async () => {
      const sourceName = 'MeteoBlue';
      const response = await client
        .get(`/forecasts?source=${sourceName}`)

      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.equal('text/csv');
      const rows = response.text.trim().split('\n').slice(1); 
      rows.forEach(row => {
          const columns = row.split(',');
          expect(columns[0].trim()).to.equal(sourceName);
      });
    });

    it('should return an error for an invalid source', async () => {
      const invalidSource = 'invalidSource';
      const response = await client
        .get(`/forecasts?source=${invalidSource}`) 

      expect(response.status).to.equal(404);
      expect(response.text).to.include('NotFoundError: Source not found');
    });
  });

  describe('GET /forecasts?city={} & startDate={} & endDate={}', () => {
    it('should successfully return forecasts within requested date range only', async () => {
      const cities = ['Tokyo', 'Berlin', 'Tofo'];
      const startDate = '2024-09-01'
      const endDate =  '2024-09-07'

      const response = await client
        .get(`/forecasts?city=${cities}&startDate=${startDate}&endDate=${endDate}`)

      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.equal('text/csv');
      const rows = response.text.trim().split('\n').slice(1); 
      rows.forEach(row => {
          const columns = row.split(',');
          const forecastDate = columns[5].trim();
          expect(forecastDate >= startDate && forecastDate <= endDate).to.be.true;
      });
    });

    it('should return an error if startDate is after endDate', async () => { 
      const cities = ['Tokyo', 'Berlin', 'Tofo'];
      const startDate = '2024-09-07'
      const endDate = '2024-09-01'

      const response = await client
        .get(`/forecasts?city=${cities}&startDate=${startDate}&endDate=${endDate}`)

      expect(response.status).to.equal(400);
      expect(response.text).to.include('BadRequestError: startDate cannot be after endDate');
    });

    it('should return an error if date is invalid', async () => {
      const cities = ['Tokyo', 'Berlin', 'Tofo'];
      const startDate = '2023-22-29' // TODOX this is not a valid date 2023-02-29
      const endDate = '2024-09-01'

      const response = await client
        .get(`/forecasts?city=${cities}&startDate=${startDate}&endDate=${endDate}`)

        console.log(response)
      expect(response.status).to.equal(400);
      expect(response.text).to.include('BadRequestError: Invalid startDate format');
    });
  });
  

});
