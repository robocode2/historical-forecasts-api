require('dotenv').config();
import {ApplicationConfig} from '@loopback/core';

import {ExtraErrorData} from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import {once} from 'events';
import express from 'express';
import http from 'http';
import {AddressInfo} from 'net';
import {CapstoneApplication} from './application';
import {ErrorHandler} from './infrastructure/errorHandling/errorHandler';


const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const MySqlSessionStore = require('express-mysql-session')(session);
const NODE_ENV = process.env.NODE_ENV ?? '';

export {ApplicationConfig};

export const corsOptions = {
  origin: true,
  credentials: true
};

export class ExpressServer {
  private app: express.Application;
  public readonly lbApp: CapstoneApplication;
  private server?: http.Server;
  public url: String;
  private errorHandler = new ErrorHandler();


  constructor(options: ApplicationConfig = {}) {
    this.app = express();
    this.lbApp = new CapstoneApplication(options);
    this.initBasicExpressSetup();
    this.initBodyParser();
    this.initErrorHandling();
    this.initSentryLogging();
    this.initLb4RequestHandler();
  }

  private initLb4RequestHandler() {
    this.app.use('/', this.lbApp.requestHandler);
  }


  private initBasicExpressSetup() {
    this.app.use(compression());
    this.app.use(
      helmet({
        contentSecurityPolicy: false
      })
    );
    this.app.use(cookieParser());
  }



  private initSentryLogging() {
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: NODE_ENV,
        integrations: [new ExtraErrorData()]
      });
      this.app.use(Sentry.Handlers.requestHandler() as express.RequestHandler);
    }
  }

  private initErrorHandling() {
    this.app.use(this.errorHandler.handle.bind(this.errorHandler));

    // errors not caught by express => caught by node events
    process.on('unhandledRejection', (unhandledRejection) => {
      throw unhandledRejection; // converted to uncaughtException
    });
    // node uncaughtException event triggers Sentry fatal error logging + server shutdown
  }


  private initBodyParser() {
    this.app.use(
      bodyParser.json({
        limit: '10mb',
        extended: true
      })
    );
    this.app.use(
      bodyParser.urlencoded({
        limit: '10mb',
        extended: true,
        parameterLimit: 1000000
      })
    );
  }


  public async boot() {

    console.log('lb4: boot ...');
    await this.lbApp.boot();
  }

  public async start() {

    console.log('lb4: starting cultivation-planning ...');
    await this.lbApp.start();
    const port = this.lbApp.restServer.config.port || 3000;
    const host = this.lbApp.restServer.config.host ?? '127.0.0.1';
    this.server = this.app.listen(port, host);
    await once(this.server, 'listening');
    const address = <AddressInfo>this.server.address();
    this.url = `http://${address.address}:${address.port}`;
  }

  // For testing purposes
  public async stop() {
    if (!this.server) return;
    await this.lbApp.stop();
    this.server.close();
    await once(this.server, 'close');
    this.server = undefined;
  }
}
