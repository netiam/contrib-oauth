import {
  ErrorType,
  HTTPError
} from 'netiam-errors'

export class OAuthError extends HTTPError {
  toJSON() {
    const err = {
      error: this.code.substr('OAUTH_'.length).toLowerCase(),
      error_description: this.message,
      status: this.status,
      id: this.id
    }
    if (process.env.NODE_ENV === 'development') {
      err.stack = this.stack
    }
    return Object.freeze(err)
  }
}

export const OAUTH_ERROR = new ErrorType('OAuth Error', 400, 'OAUTH_ERROR', 3000)
export const OAUTH_USERNAME_MISSING = new ErrorType('Parameter "username" is missing.', 400, 'OAUTH_USERNAME_MISSING', 3001)
export const OAUTH_PASSWORD_MISSING = new ErrorType('Parameter "password" is missing.', 400, 'OAUTH_PASSWORD_MISSING', 3002)
export const OAUTH_INVALID_CREDENTIALS = new ErrorType('Either "username" or "password" is invalid.', 400, 'OAUTH_INVALID_CREDENTIALS', 3003)
export const OAUTH_INVALID_PASSWORD = new ErrorType('Invalid password.', 400, 'OAUTH_INVALID_PASSWORD', 3004)
export const OAUTH_INVALID_REFRESH_TOKEN = new ErrorType('Invalid "refresh_token".', 400, 'OAUTH_INVALID_REFRESH_TOKEN', 3005)
export const OAUTH_INVALID_HTTP_METHOD = new ErrorType('Invalid HTTP method.', 400, 'OAUTH_INVALID_HTTP_METHOD', 3006)
export const OAUTH_CLIENT_ID_MISSING = new ErrorType('Parameter "client_id" is missing.', 400, 'OAUTH_CLIENT_ID_MISSING', 3007)
export const OAUTH_UNSUPPORTED_RESPONSE_TYPE = new ErrorType('Unknown value for parameter "response_type".', 400, 'OAUTH_UNSUPPORTED_RESPONSE_TYPE', 3008)
export const OAUTH_INVALID_CLIENT = new ErrorType('Client does not exist.', 400, 'OAUTH_INVALID_CLIENT', 3009)
export const OAUTH_GRANT_TYPE_MISSING = new ErrorType('Parameter "grant_type" is missing.', 400, 'OAUTH_GRANT_TYPE_MISSING', 3010)
export const OAUTH_UNSUPPORTED_GRANT_TYPE = new ErrorType('Unsupported value for parameter "grant_type"', 400, 'OAUTH_UNSUPPORTED_GRANT_TYPE', 3011)
