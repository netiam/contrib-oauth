import bodyParser from 'body-parser'
import express from 'express'
import routes from './routes'

export default function() {
  const app = express()

  app.use(bodyParser.urlencoded({extended: false}))

  routes(app)

  return app
}
