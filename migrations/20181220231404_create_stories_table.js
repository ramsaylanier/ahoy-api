exports.up = function(knex, Promise) {
  return knex.schema.createTable('projects', table => {
    table.increments('id').primary()
    table.string('title')
    table.text('description')
    table.string('owner')
    table.timestamp('created_at')
    table.timestamp('updated_at')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('project')
}
