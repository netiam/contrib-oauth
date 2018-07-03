import bcrypt from 'bcrypt';
import Sequelize from 'sequelize';
import { db } from '../utils/db';
import Token from './token';

const User = db.define(
  'User',
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      isUUID: 4,
      defaultValue: Sequelize.UUIDV4
    },
    email: {
      type: Sequelize.STRING,
      unique: true
    },
    username: {
      type: Sequelize.STRING,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      unique: true
    },
    birthday: Sequelize.DATE
  },
  {
    hooks: {
      beforeCreate: (user) => {
        if (!user.password) {
          return;
        }

        return bcrypt
          .genSalt(10)
          .then((salt) => {
            return bcrypt.hash(user.password, salt);
          })
          .then((hash) => {
            user.password = hash;
          });
      },
      beforeUpdate: (user, options) => {
        if (!user.changed('password')) {
          return;
        }

        return bcrypt
          .genSalt(10)
          .then((salt) => {
            return bcrypt.hash(user.password, salt);
          })
          .then((hash) => {
            user.password = hash;
          });
      }
    }
  }
);

User.hasMany(Token, { as: 'owner' });
Token.belongsTo(User, { as: 'owner' });

export default User;
