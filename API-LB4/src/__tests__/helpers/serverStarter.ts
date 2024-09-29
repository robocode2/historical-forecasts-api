require('dotenv').config();
import {ExpressServer} from '../../server';
import {Client, givenHttpServerConfig, supertest} from './test-modules';

export async function setupApplication(): Promise<IAppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    expressSettings: {
      views: 'public',
      'view engine': 'pug',
      env: process.env.NODE_ENV ?? 'development',
      'strict routing': true
    },
    host: process.env.HOST ?? '127.0.0.1',
    port: +(process.env.PORT ?? 4000),

    openApiSpec: {
      // useful when used with OpenAPI-to-GraphQL to locate your application
      setServersFromRequest: true
    },
    listenOnStart: false
  });

  const server = new ExpressServer({
    rest: restConfig
  });

  await server.boot();
  await server.start();

  const client = supertest(server.url);

  return {server, client};
}

export interface IAppWithClient {
  server: ExpressServer;
  client: Client;
}
