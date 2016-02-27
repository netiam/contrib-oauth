import _ from 'lodash'
import bcrypt from 'bcrypt-as-promised'
import {HTTPError} from 'netiam-errors'
import moment from 'moment'
import Promise from 'bluebird'
import {
  OAUTH_INVALID_REFRESH_TOKEN
} from '../errors'

const TOKEN_TYPE_ACCESS = 'access_token'
const TOKEN_TYPE_REFRESH = 'refresh_token'

const ACCESS_TOKEN_TYPE_BEARER = 'bearer'

export default function({
  req,
  res,
  tokenModel,
  tokenField,
  accessTokenTTL,
  refreshTokenTTL
  }) {
  const {
    refresh_token,
    scope} = req.body

  if (!_.isString(refresh_token) || refresh_token.length === 0) {
    return Promise.reject(new HTTPError(OAUTH_INVALID_REFRESH_TOKEN))
  }

  return tokenModel
  // TODO Check expiration date
    .findOne({where: {[tokenField]: refresh_token}})
    .then(token => {
      if (!token) {
        return Promise.reject(new HTTPError(OAUTH_INVALID_REFRESH_TOKEN))
      }

      return token.getOwner()
        .then(owner => {
          const accessToken = tokenModel
            .build({
              type: TOKEN_TYPE_ACCESS,
              expires_at: moment().add(accessTokenTTL, 'hours').format(),
              ownerId: owner.id
            })
          const refreshToken = tokenModel
            .build({
              type: TOKEN_TYPE_REFRESH,
              expires_at: moment().add(refreshTokenTTL, 'days').format(),
              ownerId: owner.id
            })

          return Promise
            .all([accessToken, refreshToken])
            .then(tokens => {
              const [accessToken, refreshToken] = tokens
              res.body = {
                access_token: accessToken[tokenField],
                refresh_token: refreshToken[tokenField],
                token_type: ACCESS_TOKEN_TYPE_BEARER,
                expires_in: moment(accessToken.expires_at).diff(moment(), 'seconds'),
                user_id: owner.id
              }
            })
            .then(() => token.destroy())
        })
    })
}
