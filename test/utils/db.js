import Sequelize from 'sequelize'

export const db = new Sequelize('netiam', 'netiam', 'netiam', {
  dialect: 'sqlite',
  storage: './test/db.sqlite',
  logging: false //console.log
})

export function setup(done) {
  db
    .sync()
    .then(() => done())
    .catch(done)
}

export function teardown(done) {
  db
    .drop()
    .then(() => done())
    .catch(done)
}
