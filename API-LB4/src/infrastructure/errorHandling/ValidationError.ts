import {CustomError} from 'ts-custom-error';

export interface IDetail {
  path: string[];
  type: Type;
}

enum Type {
  DUPLICATE = 'duplicate',
  NOT_FOUND = 'not_found',
  MAX_LIMIT = 'max_limit'
}

export class ValidationError extends CustomError {
  readonly code = 'VALIDATION_ERROR';
  readonly details?: IDetail[];

  public constructor(message: string, details?: IDetail[]) {
    super(message);
    this.details = details;
  }

  static readonly messages = {
    INVALID_INPUT: 'invalid input',
    INVALID_ID: 'invalid id',
    DUPLICATE: 'duplicate exists',
    DELETION_NOT_ALLOWED: 'deletion not allowed',
    EDITING_NOT_ALLOWED: 'editing not allowed',
    ACCESS_NOT_ALLOWED: 'access not allowed',
    MAX_LIMIT: 'maximum limit reached',
    NOT_FOUND: 'not found',
    INVALID_REQUEST_BODY: 'invalid request body',
    INVALID_REQUEST: 'invalid request',
    NOT_HANDLED: 'not handled',
    REQUIRED: 'required'
  };

  static readonly Type = Type;
}
