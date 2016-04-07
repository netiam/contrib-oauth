import Promise from 'bluebird'
import grantPassword from './grant-types/password'
import grantRefreshToken from './grant-types/refresh-token'
import {
  OAuthError,
  OAUTH_INVALID_HTTP_METHOD,
  OAUTH_CLIENT_ID_MISSING,
  OAUTH_UNSUPPORTED_RESPONSE_TYPE,
  OAUTH_INVALID_CLIENT,
  OAUTH_GRANT_TYPE_MISSING,
  OAUTH_UNSUPPORTED_GRANT_TYPE
} from './errors'

const RESPONSE_TYPE_CODE = 'code'
const RESPONSE_TYPE_TOKEN = 'token'

const GRANT_TYPE_PASSWORD = 'password'
const GRANT_TYPE_REFRESH_TOKEN = 'refresh_token'
const GRANT_TYPE_CLIENT_CREDENTIALS = 'client_credentials'
const GRANT_TYPE_AUTHORIZATION_CODE = 'authorization_code'

function authorize({userModel, clientModel, tokenModel, codeModel}) {

  return function(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return Promise.reject(new OAuthError(OAUTH_INVALID_HTTP_METHOD))
    }

    const {
      response_type,
      client_id,
      redirect_uri,
      scope,
      state
    } = Object.assign({}, req.query, req.body)

    if (!client_id || client_id.length === 0) {
      return Promise.reject(new OAuthError(OAUTH_CLIENT_ID_MISSING))
    }

    if (response_type !== RESPONSE_TYPE_CODE
      && response_type !== RESPONSE_TYPE_TOKEN) {
      return Promise.reject(new OAuthError(OAUTH_UNSUPPORTED_RESPONSE_TYPE))
    }

    return clientModel
      .findOne({where: {id: client_id}})
      .then(client => {
        if (!client) {
          return Promise.reject(new OAuthError(OAUTH_INVALID_CLIENT))
        }
        // TODO check response_type and issue a code or a token
        return codeModel.create({client})
      })
      .then(code => {
        if (!code) {
          return Promise.reject(new OAuthError(OAUTH_INVALID_CLIENT))
        }

        // TODO Redirect if not implicit flow and add code to URI
        // res.redirect(redirect_uri)

        // TODO Return token on implicit flow
        // res.json(res.body)
      })
  }
}

function token({
  userModel,
  clientModel,
  tokenModel,
  codeModel,
  accessTokenTTL = 1,
  refreshTokenTTL = 14,
  destroyTokenAfterUse = false
}) {
  // TODO Must be set by plugin config or defaults!
  const usernameField = 'email'
  const passwordField = 'password'
  const tokenField = 'token'

  return function(req, res) {
    const {grant_type} = req.body

    if (req.method !== 'POST') {
      return Promise.reject(new OAuthError(OAUTH_INVALID_HTTP_METHOD))
    }

    if (!grant_type) {
      return Promise.reject(new OAuthError(OAUTH_GRANT_TYPE_MISSING))
    }

    if (grant_type === GRANT_TYPE_PASSWORD) {
      // TODO Provide config object
      return grantPassword({
        req,
        res,
        userModel,
        tokenModel,
        usernameField,
        passwordField,
        tokenField,
        accessTokenTTL,
        refreshTokenTTL
      })
    }

    if (grant_type === GRANT_TYPE_REFRESH_TOKEN) {
      // TODO Provide config object
      return grantRefreshToken({
        req,
        res,
        tokenModel,
        userModel,
        tokenField,
        accessTokenTTL,
        refreshTokenTTL,
        destroyTokenAfterUse
      })
    }

    return Promise.reject(new OAuthError(OAUTH_UNSUPPORTED_GRANT_TYPE))
  }

}

function revoke({userModel, clientModel, tokenModel, codeModel}) {
  return function(req, res) {

  }
}

export default Object.freeze({
  authorize,
  token,
  revoke
})
