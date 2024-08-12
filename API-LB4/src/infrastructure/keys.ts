import {BindingKey} from '@loopback/core';
import {IErrorHandler} from './errorHandling/errorHandler';

export namespace Shared {
  export namespace Service {
    export const ERROR_HANDLER = BindingKey.create<IErrorHandler>('shared.services.errorHandler');
  }
}
