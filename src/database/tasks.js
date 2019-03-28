import { Model } from 'objection'
import { getProject } from './projects'

export class Task extends Model {
  $beforeInsert() {
    const now = new Date().toISOString()
    this.created_at = now
    this.updated_at = now
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString()
  }

  static tableName = 'tasks'
  static relationMappings = () => {
    const Project = require('./projects').Project
    return {
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: 'tasks.project_id',
          to: 'projects.id'
        }
      }
    }
  }
}

const normalizeTask = task => ({
  id: task.id,
  title: task.title,
  description: task.description,
  project_id: task.projectId
})

export const getTasks = ownerId => {
  if (ownerId) {
    return Task.query()
      .where('owner', ownerId)
      .orderBy('created_at', 'desc')
  } else {
    return Task.query().orderBy('created_at', 'desc')
  }
}

export const getTask = (id, userId) => {
  if (!userId) {
    console.error('not authenticated')
    throw new Error('Not Authenticated')
  }

  return Task.query()
    .where('id', id)
    .first()
}

export const createTask = async (task, user) => {
  if (!user.id) {
    console.error('not authenticated')
    throw new Error('Not Authenticated')
  }

  try {
    const project = await getProject(task.projectId, user.id)
    const newTask = await project
      .$relatedQuery('tasks')
      .insert(normalizeTask(task))

    return newTask
  } catch (err) {
    console.log(err)
  }
}
