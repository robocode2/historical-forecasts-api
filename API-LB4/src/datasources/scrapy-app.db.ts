import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as fs from 'fs';
import * as path from 'path';

const caCert = fs.readFileSync(path.resolve(__dirname, 'ca-certificate.crt')).toString();

const mainConfig = {
  name: 'defaultdb',
  connector: 'postgresql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  url: '', // Add your Database URL without ssl mode parameter
  user: process.env.DB_USER,
  password: process.env.DB_PASSWD,
  database: process.env.DB_DEV_SCHEMA,
  ssl: {
    ca: caCert,
    rejectUnauthorized: true,
  },
};

const testConfig = {
  name: process.env.TEST_DB_NAME,
  connector: "postgresql",
  host: '127.0.0.1', 
  port: 5434,          // Match the port from your docker-compose.yml
  user: '',    // Add your Postgres user
  password: '', // Add your Postgres password
  database: '', // Add the name of your database
  ssl: false,       
};

const config = process.env.NODE_ENV === 'test' ? testConfig : mainConfig;



@lifeCycleObserver('datasource')
export class ScrapyAppDb extends juggler.DataSource implements LifeCycleObserver {
  static dataSourceName = 'ScrapyApp';
  static readonly defaultConfig = config;

  constructor(
    @inject(`datasources.config. + ${config.name}`, {optional: true})
    dsConfig: object = config
  ) {
    super(dsConfig);
  }
}
