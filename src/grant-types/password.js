import _ from 'lodash';
import bcrypt from 'bcrypt';
import { HTTPError } from 'netiam-errors';
import moment from 'moment';
import {
  OAUTH_INVALID_CREDENTIALS,
  OAUTH_INVALID_PASSWORD,
  OAUTH_PASSWORD_MISSING,
  OAUTH_USERNAME_MISSING
} from '../errors';

const TOKEN_TYPE_ACCESS = 'access_token';
const TOKEN_TYPE_REFRESH = 'refresh_token';

const ACCESS_TOKEN_TYPE_BEARER = 'bearer';

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
  const { username, password, scope, state } = req.body;

  if (!_.isString(username) || username.length === 0) {
    return Promise.reject(new HTTPError(OAUTH_USERNAME_MISSING));
  }

  if (!_.isString(password) || password.length === 0) {
    return Promise.reject(new HTTPError(OAUTH_PASSWORD_MISSING));
  }

  return userModel.findOne({ where: { [usernameField]: username } }).then(async (user) => {
    if (!user) return Promise.reject(new HTTPError(OAUTH_INVALID_CREDENTIALS));

    const match = await bcrypt.compare(password, user[passwordField]);
    if (!match) return Promise.reject(new HTTPError(OAUTH_INVALID_PASSWORD));

    const accessToken = tokenModel.create({
      type: TOKEN_TYPE_ACCESS,
      expires_at: moment()
        .add(accessTokenTTL, 'hours')
        .format(),
      ownerId: user.id
    });
    const refreshToken = tokenModel.create({
      type: TOKEN_TYPE_REFRESH,
      expires_at: moment()
        .add(refreshTokenTTL, 'days')
        .format(),
      ownerId: user.id
    });

    return Promise.all([accessToken, refreshToken]).then((tokens) => {
      const [accessToken, refreshToken] = tokens;
      res.body = {
        access_token: accessToken[tokenField],
        refresh_token: refreshToken[tokenField],
        token_type: ACCESS_TOKEN_TYPE_BEARER,
        expires_in: moment(accessToken.expires_at).diff(moment(), 'seconds'),
        user_id: user.id
      };
    });
  });
}
