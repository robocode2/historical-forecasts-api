import {Request} from '@loopback/rest';

export type RequestType = 'html' | 'json';

export function getRequestType(req: Request): RequestType {
  return req.accepts('html') === 'html' ? 'html' : 'json';
}
