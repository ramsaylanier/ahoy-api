import { Model } from 'objection'
import Knex from 'knex'
import config from 'config'

const { host, port, user, password, name } = config.get('db')

const connection = Knex({
  client: 'pg',
  version: '7.2',
  connection: {
    host,
    port,
    user,
    password,
    database: name
  }
})

Model.knex(connection)

export default connection
