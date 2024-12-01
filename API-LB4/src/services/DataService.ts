import {inject, injectable} from '@loopback/core';
import _ from 'lodash';
import { Util } from './keys';
import { BaseCityRepository, BaseCountryRepository, BaseSourceRepository } from '../repositories';
import { Base } from '../repositories/keys';
import * as path from 'path';
import * as csvWriter from 'csv-writer';
import fs from 'fs';
import { parse } from 'csv-parse';
import { City, Country, Forecast, ForecastWithRelations, Source } from '../models';
import {Response} from '@loopback/rest';
import { logger } from '../infrastructure/logging/logger';

export interface IDataService {
 generateAndSendCSV(res: Response, forecasts: ForecastWithRelations[]): Promise<void>
}

@injectable({tags: {key: Util.Service.DATA}})
export class DataService implements IDataService {
  constructor(
    @inject(Base.Repository.CITY) private cityRepository: BaseCityRepository,
    @inject(Base.Repository.COUNTRY) private countryRepository: BaseCountryRepository,
    @inject(Base.Repository.SOURCE) private sourceRepository: BaseSourceRepository,
    ) { }


  async generateAndSendCSV(res: Response, forecasts: ForecastWithRelations[]): Promise<void> {
        const groupedData = await this.groupDataByCityCountrySource(forecasts);
        const csvPath = await this.saveGroupedDataAsCSV(groupedData);
        if (fs.existsSync(csvPath)) {
          const stats = fs.statSync(csvPath);
      
          if (stats.size > 0) {
            res.setHeader('Content-Disposition', 'attachment; filename=forecasts.csv');
            res.setHeader('Content-Type', 'text/csv');
      
            try {
              const csvData = await this.createReadStream(csvPath);
      
              if (csvData.length > 0) {
                res.write(csvData.join('\n'));
                res.end();
      
                fs.unlink(csvPath, (err) => {
                  if (err) {
                    logger.error('Error deleting file:', err);
                  } else {
                    logger.info('CSV file deleted successfully');
                  }
                });
              } else {
                res.status(404).send('CSV file is empty');
              }
            } catch (error) {
              logger.error('Error reading file:', error);
              res.status(500).send('Internal Server Error');
            }
          } else {
            res.status(404).send('CSV file is empty');
          }
        } else {
          res.status(404).send('CSV file not found');
        }
      }
      
       private async createReadStream(filePath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
          const csvData: string[] = [];
          fs.createReadStream(filePath)
            .pipe(parse({ delimiter: ',', from_line: 1 }))
            .on('data', (row) => {
              csvData.push(row.join(',')); 
            })
            .on('end', () => resolve(csvData))
            .on('error', (error) => reject(error));
        });
      }
    
    
      
      private async groupDataByCityCountrySource(forecasts: ForecastWithRelations[]) {
        const groupedData = {
          cities: [] as City[],
          forecasts: [] as Forecast[],
          sources: [] as Source[], 
        };
      
        const cityMap = new Map<number, City>();
        const countryMap = new Map<number, Country>();
        const sourceMap = new Map<number, Source>();
      
        const cityIds = [...new Set(forecasts.map(f => f.cityId))];
        const countryIds = [...new Set(forecasts.map(f => f.countryId))];
        const sourceIds = [...new Set(forecasts.map(f => f.sourceId))];
      
        const cities = await Promise.all(cityIds.map(id => this.cityRepository.findById(id)));
        const countries = await Promise.all(countryIds.map(id => this.countryRepository.findById(id)));
        const sources = await Promise.all(sourceIds.map(id => this.sourceRepository.findById(id)));
      
        cities.forEach(city => cityMap.set(city.id, city));
        countries.forEach(country => countryMap.set(country.id, country));
        sources.forEach(source => sourceMap.set(source.id, source));
      
        for (const forecast of forecasts) {
          groupedData.cities.push(cityMap.get(forecast.cityId)!);
          groupedData.forecasts.push(forecast);
        }
        groupedData.sources = Array.from(sourceMap.values()); 
    
        return groupedData;
      }
    
      private saveGroupedDataAsCSV(groupedData: any): Promise<string> {
        const outputPath = path.join(__dirname, 'forecasts.csv');
        const csvWriterInstance = csvWriter.createObjectCsvWriter({
          path: outputPath,
          header: [
            { id: 'source', title: 'source' },
            { id: 'city', title: 'city' },
            { id: 'country', title: 'country' },
            { id: 'state', title: 'state' },
            { id: 'collection_date', title: 'collection_date' },
            { id: 'forecasted_day', title: 'forecasted_day' },
            { id: 'temp_high', title: 'temp_high' },
            { id: 'temp_low', title: 'temp_low' },
            { id: 'wind_speed', title: 'wind_speed' },
            { id: 'humidity', title: 'humidity' },
            { id: 'precipitation_chance', title: 'precipitation_chance' },
            { id: 'precipitation_amount', title: 'precipitation_amount' },
            { id: 'weather_condition', title: 'weather_condition' },
          ],
        });
      
        const groupedBySourceAndCity: { [key: string]: any[] } = {};
      
        for (const forecast of groupedData.forecasts) {
          const city = groupedData.cities.find((c: City) => c.id === forecast.cityId);
          const source = groupedData.sources.find((s: Source) => s.id === forecast.sourceId);
      
          if (city && source) {
            const sourceCityKey = `${source.name}-${city.name}`;
      
            if (!groupedBySourceAndCity[sourceCityKey]) {
              groupedBySourceAndCity[sourceCityKey] = [];
            }
      
            const formatDate = (dateStr: string) => {
              return new Date(dateStr);
            };
    
            groupedBySourceAndCity[sourceCityKey].push({
              source: source.name,
              city: city.name,
              country: forecast.country.name || 'Country unknown',
              state: forecast.state,
              collection_date: formatDate(forecast.collection_date),
              forecasted_day: formatDate(forecast.forecasted_day),
              temp_high: forecast.temp_high,
              temp_low: forecast.temp_low,
              wind_speed: forecast.wind_speed,
              humidity: forecast.humidity,
              precipitation_chance: forecast.precipitation_chance,
              precipitation_amount: forecast.precipitation_amount,
              weather_condition: ' "' + forecast.weather_condition + ' "',
            });
          }
        }
      
      const records = Object.values(groupedBySourceAndCity).flat();
    
      return new Promise<string>((resolve, reject) => {
        csvWriterInstance.writeRecords(records)
          .then(() => {
            logger.info('CSV file has been written successfully');
            resolve(outputPath);
          })
          .catch((err: any) => {
            console.error('Error writing CSV file:', err);
            logger.error('Error writing CSV file:', err);
            reject(err);
          });
      });
      }
}
