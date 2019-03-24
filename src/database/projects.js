import { Model } from 'objection'

class Project extends Model {
  $beforeInsert() {
    const now = new Date().toISOString()
    this.created_at = now
    this.updated_at = now
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString()
  }

  static tableName = 'projects'
}

export const getProjects = ownerId => {
  if (ownerId) {
    return Project.query()
      .where('owner', ownerId)
      .orderBy('created_at', 'desc')
  } else {
    return Project.query().orderBy('created_at', 'desc')
  }
}

export const getProject = id =>
  Project.query()
    .where('id', id)
    .first()

export const createProject = async (project, user) => {
  console.log(user)
  if (!user.id) {
    console.error('not authenticated')
    throw new Error('Not Authenticated')
  }
  project.owner = user.id
  return Project.query().insert(project)
}

export default { getProjects, getProject }
