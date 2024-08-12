const codeToStatusCodeMap: {[code: string]: number} = {
  VALIDATION_ERROR: 400, // ValidationError
  AUTHORIZATION_ERROR: 401, // AuthorizationError
  ENTITY_NOT_FOUND: 404, // loopback repository error
  NOT_FOUND_ERROR: 404, // NotFoundError
  INTERNAL_ERROR: 500, // InternalError
  REQUEST_ERROR: 500 // RequestError (Request made to 3rd party)
};

function mapCodeToStatusCode(code: string): number {
  return codeToStatusCodeMap[code];
}

export {mapCodeToStatusCode};

