// Update with your config settings.
const config = require('config')
const { host, port, name, user, password } = config.get('db')

const connection = {
  host,
  port,
  database: name,
  user,
  password
}

module.exports = {
  development: {
    client: 'postgresql',
    connection,
    seeds: {
      directory: './seeds/dev'
    }
  },

  staging: {
    client: 'postgresql',
    connection,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
}
