import {Provider} from '@loopback/core';
import {Reject} from '@loopback/rest';

export class CustomRejectProvider implements Provider<Reject> {
  value(): Reject {
    return (context, error) => {
      throw error;
    };
  }
}
