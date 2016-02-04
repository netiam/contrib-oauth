import express from 'express'
import netiam from 'netiam'
import {plugins} from './api'
import Client from '../models/client'
import Code from '../models/code'
import Token from '../models/token'
import User from '../models/user'

export default function(app) {

  const router = express.Router()

  router.get(
    '/oauth/authorize',
    netiam({plugins})
      .oauth.authorize({
        clientModel: Client,
        codeModel: Code,
        tokenModel: Token,
        userModel: User
      })
      .json()
  )

  router.post(
    '/oauth/authorize',
    netiam({plugins})
      .oauth.authorize({
        clientModel: Client,
        codeModel: Code,
        tokenModel: Token,
        userModel: User
      })
      .json()
  )

  router.post(
    '/oauth/token',
    netiam({plugins})
      .oauth.token({
        clientModel: Client,
        codeModel: Code,
        tokenModel: Token,
        userModel: User
      })
      .json()
  )

  app.use('/', router)

}
