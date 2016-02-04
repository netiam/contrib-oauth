import crypto from 'crypto'
import moment from 'moment'
import Sequelize from 'sequelize'
import Client from './client'
import {db} from '../utils/db'

const Code = db.define('Code', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  expires_at: {
    type: Sequelize.DATE,
    defaultValue: function() {
      return moment()
        .add(5, 'minutes')
        .format()
    }
  }
})

Code.belongsTo(Client, {as: 'client'})

export default Code
