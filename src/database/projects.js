import { Model, raw } from 'objection'

export class Project extends Model {
  $beforeInsert() {
    const now = new Date().toISOString()
    this.created_at = now
    this.updated_at = now
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString()
  }

  static tableName = 'projects'
  static relationMappings = () => {
    const Task = require('./tasks').Task
    return {
      tasks: {
        relation: Model.HasManyRelation,
        modelClass: Task,
        join: {
          from: 'projects.id',
          to: 'tasks.project_id'
        }
      }
    }
  }
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

export const getProject = async (id, userId) => {
  if (!userId) {
    console.error('not authenticated')
    throw new Error('Not Authenticated')
  }

  return Project.query()
    .where('id', id)
    .andWhere(function() {
      this.where('owner', userId)
    })
    .first()
}

export const createProject = async (project, user) => {
  if (!user.id) {
    console.error('not authenticated')
    throw new Error('Not Authenticated')
  }
  project.owner = user.id
  return Project.query().insert(project)
}

export const addUserToProject = async (projectId, userId) => {
  if (!userId) {
    console.error('not authenticated')
    throw new Error('Not Authenticated')
  }

  return Project.query().updateAndFetchById(projectId, {
    members: raw('array_append(members, ?)', [userId])
  })
}

export const getProjectTasks = async (projectId, userId) => {
  if (!userId) {
    console.error('not authenticated')
    throw new Error('Not Authenticated')
  }

  try {
    const project = await getProject(projectId, userId)
    const tasks = await project.$relatedQuery('tasks')
    return tasks
  } catch (err) {
    console.log(err)
  }
}

export default { getProjects, getProject }
