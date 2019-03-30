exports.seed = (knex, Promise) => {
  // Deletes ALL existing entries
  return knex('projects')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('projects').insert([
        {
          id: 1,
          title: 'This is a project title',
          description: 'This is a project description',
          owner: 'google-oauth2|104564660075265244452',
          members: [],
          created_at: new Date(),
          updated_at: new Date()
        }
      ])
    })
}
