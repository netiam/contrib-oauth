import crypto from 'crypto'
import Sequelize from 'sequelize'
import {db} from '../utils/db'

const Client = db.define('Client', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  secret: {
    type: Sequelize.STRING,
    defaultValue: function() {
      return crypto.randomBytes(48).toString('hex')
    }
  }
})

export default Client
