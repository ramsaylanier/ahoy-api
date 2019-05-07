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
  project_id: task.projectId,
  order: task.order
})

const isProjectOwnerByTask = async ({ task, userId }) => {
  const project = await task.$relatedQuery('project')
  return project.owner === userId
}

export const getTasks = ownerId => {
  if (ownerId) {
    return Task.query()
      .where('owner', ownerId)
      .orderBy('order', 'desc')
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

export const getTaskProject = async (taskId, userId) => {
  if (!userId) {
    console.error('not authenticated')
    throw new Error('Not Authenticated')
  }

  const task = await getTask(taskId, userId)
  return task.$relatedQuery('project')
}

export const getTaskCount = async projectId => {
  const { count } = await Task.query()
    .where('project_id', projectId)
    .first()
    .count()
    .as('numberOfTasks')
  return Number(count)
}

export const createTask = async (task, user) => {
  if (!user.id) {
    console.error('not authenticated')
    throw new Error('Not Authenticated')
  }

  try {
    const taskCount = await getTaskCount(task.projectId)
    task.order = taskCount + 1
    task.completed = false
    const project = await getProject(task.projectId, user.id)
    const newTask = await project
      .$relatedQuery('tasks')
      .insert(normalizeTask(task))

    return newTask
  } catch (err) {
    console.log(err)
  }
}

export const completeTask = async (taskId, user) => {
  if (!user.id) {
    console.error('not authenticated')
    throw new Error('Not Authenticated')
  }

  try {
    const task = await Task.query().findById(taskId)

    if (!isProjectOwnerByTask({ task, userId: user.id })) {
      throw new Error('Not Authorized To Update This Task')
    }

    await task.$query().patch({ completed: !task.completed })
    return task
  } catch (err) {
    console.log(err)
  }
}

export const updateTaskDescription = async (taskId, description, user) => {
  if (!user || !user.id) {
    console.error('not authenticated')
    throw new Error('Not Authenticated')
  }

  try {
    const task = await Task.query().findById(taskId)

    if (!isProjectOwnerByTask({ task, userId: user.id })) {
      throw new Error('Not Authorized To Update This Task')
    }
    await task.$query().patch({ description })
    return task
  } catch (err) {
    console.log(err)
  }
}

export const deleteTasks = async (ids, user) => {
  if (!user.id) {
    console.error('not authenticated')
    throw new Error('Not Authenticated')
  }

  try {
    await Task.query()
      .whereIn('id', ids)
      .del()
    return ids
  } catch (err) {
    console.log(err)
  }
}

export const updateTaskOrder = async (id, order, user) => {
  if (!user.id) {
    console.error('not authenticated')
    throw new Error('Not Authenticated')
  }

  try {
    const task = await Task.query()
      .where({ id })
      .first()

    if (!isProjectOwnerByTask({ task, userId: user.id })) {
      throw new Error('Not Authorized To Update This Task')
    }

    const newTask = await Task.query()
      .update({ order })
      .where({ id })

    return newTask
  } catch (err) {
    console.log(err)
  }
}
