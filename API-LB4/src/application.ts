import {
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication, RestBindings} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import {RateLimiterComponent} from 'loopback4-ratelimiter';
import {ScrapyAppDb} from './datasources';
import {MySequence} from './sequence';
import path = require('path');
import { ErrorHandler } from './infrastructure/errorHandling/errorHandler';
import { Shared } from './infrastructure/keys';
import { CustomRejectProvider } from './infrastructure/errorHandling';

export {ApplicationConfig};

export class CapstoneApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    
    // Bind datasource
    this.dataSource(ScrapyAppDb, UserServiceBindings.DATASOURCE_NAME);


    this.bind(RestBindings.SequenceActions.REJECT).toProvider(CustomRejectProvider);
    this.bind(Shared.Service.ERROR_HANDLER).toClass(ErrorHandler);
    
    this.component(RateLimiterComponent);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
      repositories: {
        glob: '/repositories/*Repository.js'
      },
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
      datasources: {
        glob: '/datasources/**/*.db.js'
      },

      services: {
        // includes context services, use cases and repositories
        glob: '/{contexts,shared}/**/*{ervice,UseCase,epository,Delegator}.js'
      },
    };
  }
}
