const createProjectsTable = knex => {
  return knex.schema.createTable('projects', table => {
    table.increments('id').primary()
    table.string('title')
    table.text('description')
    table.string('owner')
    table.specificType('members', 'text ARRAY')
    table.unique('members')
    table.timestamp('created_at')
    table.timestamp('updated_at')
  })
}

const createTasksTable = knex => {
  return knex.schema.createTable('tasks', table => {
    table.increments('id').primary()
    table.string('project_id')
    table.string('title')
    table.text('description')
    table.timestamp('created_at')
    table.timestamp('updated_at')
  })
}

exports.up = function(knex, Promise) {
  return Promise.all([createProjectsTable(knex), createTasksTable(knex)])
}

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('projects'),
    knex.schema.dropTable('tasks')
  ])
}
