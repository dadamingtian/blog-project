import { RESPONSE_CODE } from './response.js';

export default class HttpError extends Error {
  constructor({
    statusCode = 500,
    message = 'Internal server error',
    code = RESPONSE_CODE.ERROR,
    data = null,
    isOperational = true
  } = {}) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
    this.data = data;
    this.isOperational = isOperational;
  }
}
