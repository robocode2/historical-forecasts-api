import {ApplicationConfig} from '@loopback/core';
import {CapstoneApplication} from './application';
import { logger } from './infrastructure/logging/logger';

/**
 * Export the OpenAPI spec from the application
 */
async function exportOpenApiSpec(): Promise<void> {
  const config: ApplicationConfig = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST ?? 'localhost',
    },
  };
  const outFile = process.argv[2] ?? '';
  const app = new CapstoneApplication(config);
  await app.boot();
  await app.exportOpenApiSpec(outFile);
}

exportOpenApiSpec().catch(err => {
  logger.error('Fail to export OpenAPI spec from the application.', err);
  process.exit(1);
});
