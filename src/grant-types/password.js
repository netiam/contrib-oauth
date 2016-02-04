import _ from 'lodash'
import bcrypt from 'bcrypt-as-promised'
import moment from 'moment'
import Promise from 'bluebird'
import {
  Codes,
  OAuthError
} from 'netiam-errors'

const TOKEN_TYPE_ACCESS = 'access_token'
const TOKEN_TYPE_REFRESH = 'refresh_token'

const ACCESS_TOKEN_TYPE_BEARER = 'bearer'

export default function({
  req,
  res,
  userModel,
  tokenModel,
  usernameField,
  passwordField,
  tokenField,
  accessTokenTTL,
  refreshTokenTTL
  }) {
  const {
    username,
    password,
    scope,
    state} = req.body

  if (!_.isString(username) || username.length === 0) {
    return Promise.reject(
      new OAuthError({
        status: 400,
        code: Codes.E4001,
        description: `Username is missing.`,
        uri: `${req.get('host')}/v2/oauth/error?code=${Codes.E4001.type}`,
        state
      })
    )
  }

  if (!_.isString(password) || password.length === 0) {
    return Promise.reject(
      new OAuthError({
        status: 400,
        code: Codes.E4001,
        description: `Password is missing.`,
        uri: `${req.get('host')}/v2/oauth/error?code=${Codes.E4001.type}`,
        state
      })
    )
  }

  return userModel
    .findOne({
      where: {[usernameField]: username}
    })
    .then(user => {
      if (!user) {
        return Promise.reject(
          new OAuthError({
            status: 400,
            code: Codes.E4001,
            description: `Either username or password is wrong.`,
            uri: `${req.get('host')}/v2/oauth/error?code=${Codes.E4001.type}`,
            state
          })
        )
      }

      return bcrypt

        .compare(password, user[passwordField])
        .then(() => {
          const accessToken = tokenModel
            .create({
              type: TOKEN_TYPE_ACCESS,
              expires_at: moment().add(accessTokenTTL, 'hours').format()
            })
            .then(token => token.setOwner(user))
          const refreshToken = tokenModel
            .create({
              type: TOKEN_TYPE_REFRESH,
              expires_at: moment().add(refreshTokenTTL, 'days').format()
            })
            .then(token => token.setOwner(user))

          return Promise
            .all([accessToken, refreshToken])
            .then(tokens => {
              res.body = {
                access_token: tokens[0][tokenField],
                refresh_token: tokens[1][tokenField],
                token_type: ACCESS_TOKEN_TYPE_BEARER,
                expires_in: moment(accessToken.expires_at).diff(moment(), 'seconds'),
                user_id: user.id
              }
            })
        })
        .catch(bcrypt.MISMATCH_ERROR, () => {
          return Promise.reject(
            new OAuthError({
              status: 400,
              code: Codes.E4001,
              description: `Invalid password.`,
              uri: `${req.get('host')}/v2/oauth/error?code=${Codes.E4001.type}`,
              state
            })
          )
        })
    })
}
