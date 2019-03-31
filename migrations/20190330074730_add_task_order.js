exports.up = function(knex, Promise) {
  return knex.schema.table('tasks', function(table) {
    table.integer('order').notNullable()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.table('tasks', function(table) {
    table.dropColumn('order')
  })
}
