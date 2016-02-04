import Promise from 'bluebird'
import {
  Codes,
  HTTPError,
  OAuthError
} from 'netiam-errors'
import grantPassword from './grant-types/password'
import grantRefreshToken from './grant-types/refresh-token'

const RESPONSE_TYPE_CODE = 'code'
const RESPONSE_TYPE_TOKEN = 'token'

const GRANT_TYPE_PASSWORD = 'password'
const GRANT_TYPE_REFRESH_TOKEN = 'refresh_token'
const GRANT_TYPE_CLIENT_CREDENTIALS = 'client_credentials'
const GRANT_TYPE_AUTHORIZATION_CODE = 'authorization_code'

function authorize({userModel, clientModel, tokenModel, codeModel}) {

  return function(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return Promise.reject(
        new OAuthError({
          status: 400,
          code: Codes.E4001,
          description: `Invalid HTTP method: "${req.method()}"`
        })
      )
    }

    const {
      response_type,
      client_id,
      redirect_uri,
      scope,
      state} = Object.assign({}, req.query, req.body)

    if (!client_id || client_id.length === 0) {
      return Promise.reject(
        new OAuthError({
          status: 400,
          code: Codes.E4002,
          description: `The client identifier is missing`,
          uri: `${req.get('host')}/v2/oauth/error?code=${Codes.E4002.type}`,
          state
        })
      )
    }

    if (response_type !== RESPONSE_TYPE_CODE
      && response_type !== RESPONSE_TYPE_TOKEN) {
      return Promise.reject(
        new OAuthError({
          status: 400,
          code: Codes.E4007,
          description: `You have requested an unkown response_type: "${response_type}"`,
          uri: `${req.get('host')}/v2/oauth/error?code=${Codes.E4007.type}`,
          state
        })
      )
    }

    return clientModel
      .findOne({where: {id: client_id}})
      .then(client => {
        if (!client) {
          return Promise.reject(
            new OAuthError({
              status: 400,
              code: Codes.E4002,
              description: `Client does not exist: "${client_id}"`,
              uri: `${req.get('host')}/v2/oauth/error?code=${Codes.E4002.type}`,
              state
            })
          )
        }
        // TODO check response_type and issue a code or a token
        return codeModel.create({client})
      })
      .then(code => {
        if (!code) {
          return Promise.reject(
            new OAuthError({
              status: 500,
              code: Codes.E4009,
              description: `Cannot issue a code. Please try again later`,
              uri: `${req.get('host')}/v2/oauth/error?code=${Codes.E4009.type}`,
              state
            })
          )
        }

        // TODO Redirect if not implicit flow and add code to URI
        // res.redirect(redirect_uri)

        // TODO Return token on implicit flow
        // res.json(res.body)
      })
  }
}

function token({userModel, clientModel, tokenModel, codeModel}) {
  // TODO Must be set by plugin config or defaults!
  const usernameField = 'email'
  const passwordField = 'password'
  const tokenField = 'token'
  const accessTokenTTL = 1 // hours
  const refreshTokenTTL = 14 // days

  return function(req, res) {
    const {grant_type} = req.body

    if (req.method !== 'POST') {
      return Promise.reject(
        new OAuthError({
          status: 400,
          code: Codes.E4001,
          description: `Invalid HTTP method: "${req.method()}"`
        })
      )
    }

    if (!grant_type) {
      return Promise.reject(
        new OAuthError({
          status: 400,
          code: Codes.E4001,
          description: `Parameter "grant_type" is missing`
        })
      )
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
        refreshTokenTTL
      })
    }

    return Promise.reject(
      new OAuthError({
        status: 500,
        code: Codes.E4005,
        description: `Please use a different grant-type than "${grant_type}". It is not supported at the moment.`
      })
    )
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
