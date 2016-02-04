import request from 'supertest'
import appMock from '../utils/app'
import Client from '../models/client'
import Code from '../models/code'
import Token from '../models/token'
import User from '../models/user'
import {
  setup,
  teardown
} from '../utils/db'
import oauth from '../../src/oauth'

const app = appMock()

describe('netiam-contrib', () => {

  let refreshToken

  before(setup)
  after(teardown)

  it('should create a user', done => {
    User
      .create({
        email: 'box@neti.am',
        password: 'test'
      })
      .then(user => {
        user.should.have.properties(['email', 'password'])
        done()
      })
      .catch(done)
  })

  it('should issue an access token', done => {
    request(app)
      .post('/oauth/token')
      .type('form')
      .send({
        grant_type: 'password',
        username: 'box@neti.am',
        password: 'test'
      })
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(res => {
        refreshToken = res.body.refresh_token
      })
      .end(done)
  })

  it('should issue a new access token w/ refresh token', done => {
    request(app)
      .post('/oauth/token')
      .type('form')
      .send({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(res => {
        res.body.should.have.properties([
          'access_token',
          'refresh_token',
          'token_type',
          'expires_in',
          'user_id'
        ])
      })
      .end(done)
  })

})
