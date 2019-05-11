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

export const getProjects = userId => {
  if (userId) {
    return Project.query()
      .where('owner', userId)
      .orWhere(raw('? = ANY (members)', userId))
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
    const tasks = await project.$relatedQuery('tasks').orderBy('order', 'asc')
    return tasks
  } catch (err) {
    console.log(err)
  }
}

export const updateProjectTitle = async (projectId, title, user) => {
  if (!user.id) {
    console.error('not authenticated')
    throw new Error('Not Authenticated')
  }

  try {
    const project = await getProject(projectId, user.id)
    if (project.owner !== user.id) {
      console.error('not creator of project')
      throw new Error('You Are Not Authorized To Make This Change')
    }

    await project.$query().patch({ title })
    return project
  } catch (err) {
    console.log(err)
  }
}

export default { getProjects, getProject }
