import request from 'supertest'
import appMock from './utils/app'
import Client from './models/client'
import Code from './models/code'
import Token from './models/token'
import User from './models/user'
import {
  setup,
  teardown
} from './utils/db'
import oauth from '../src/oauth'

const app = appMock()
let client
let user

describe('netiam-contrib', () => {

  before(setup)
  after(teardown)

  it('should create a user', done => {
    User
      .create({})
      .then(data => {
        user = data
        done()
      })
      .catch(done)
  })

  it('should create a client', done => {
    Client
      .create({id: 1})
      .then(data => {
        client = data
        done()
      })
      .catch(done)
  })

  it('should force an unsupported response_type error (w/ GET)', done => {
    request(app)
      .get('/oauth/authorize?client_id=1')
      .set('Accept', 'application/json')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(res => {
        res.body.should.have.properties([
          'error',
          'error_description'
        ])
        res.body.error.should.eql('unsupported_response_type')
      })
      .end(done)
  })

  it('should force an "unsupported_response_type" error (w/ POST)', done => {
    request(app)
      .post('/oauth/authorize')
      .type('form')
      .send({client_id: 1})
      .set('Accept', 'application/json')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(res => {
        res.body.should.have.properties([
          'error',
          'error_description'
        ])
        res.body.error.should.eql('unsupported_response_type')
      })
      .end(done)
  })

  it('should force an "invalid_client" error (w/ GET)', done => {
    request(app)
      .get('/oauth/authorize?client_id=abc&response_type=code')
      .set('Accept', 'application/json')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(res => {
        res.body.should.have.properties([
          'error',
          'error_description'
        ])
        res.body.error.should.eql('invalid_client')
      })
      .end(done)
  })

  it('should force an "invalid_client" error (w/ POST)', done => {
    request(app)
      .post('/oauth/authorize')
      .type('form')
      .send({
        response_type: 'code',
        client_id: 'abc'
      })
      .set('Accept', 'application/json')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(res => {
        res.body.should.have.properties([
          'error',
          'error_description'
        ])
        res.body.error.should.eql('invalid_client')
      })
      .end(done)
  })

  it.skip('should authorize a client by code (w/ GET)', done => {
    request(app)
      .get('/oauth/authorize?response_type=code&client_id=1')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(done)
  })

  it.skip('should authorize a client by code (w/ POST)', done => {
    request(app)
      .post('/oauth/authorize')
      .type('form')
      .send({
        response_type: 'code',
        client_id: 1
      })
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(done)
  })

})
