import '../database/db'
import {
  getProjects,
  getProject,
  createProject,
  getProjectTasks,
  updateProjectTitle
} from '../database/projects'
import {
  createTask,
  completeTask,
  updateTaskDescription,
  deleteTasks,
  getTask,
  getTaskProject,
  updateTaskOrder
} from '../database/tasks'
import authApi from '../api/authApi'
import { PubSub } from 'graphql-subscriptions'

export const pubsub = new PubSub()

export default {
  Query: {
    projects: (_, { userId }) => getProjects(userId),
    project: (_, { id }, context) => getProject(id, context.user.id),
    user: (_, { id }, context) => authApi.getUser(id, context),
    task: (_, { id }, context) => getTask(id, context.user.id)
  },
  User: {
    projects: user => getProjects(user.id)
  },
  Project: {
    owner: project => authApi.getUser(project.owner),
    members: project =>
      project.members ? authApi.getUsers(project.members) : [],
    tasks: (project, args, context) => {
      return getProjectTasks(project.id, context.user.id)
    }
  },
  Task: {
    project: (task, args, context) => getTaskProject(task.id, context.user.id)
  },
  Mutation: {
    createProject: (_, { project }, { user }) => createProject(project, user),
    updateProjectTitle: async (_, { projectId, title }, { user }) => {
      const project = await updateProjectTitle(projectId, title, user)
      pubsub.publish('projectTitleUpdated', {
        projectTitleUpdated: { ...project }
      })
      return project
    },
    createTask: (_, { task }, { user }) => createTask(task, user),
    completeTask: (_, { taskId }, { user }) => completeTask(taskId, user),
    updateTaskDescription: (_, { taskId, description }, { user }) => {
      return updateTaskDescription(taskId, description, user)
    },
    deleteTasks: (_, { ids }, { user }) => deleteTasks(ids, user),
    updateTaskOrder: (_, { id, order }, { user }) =>
      updateTaskOrder(id, order, user),
    inviteUser: (_, { projectId, email }, { user: owner }) =>
      authApi.inviteUser({ projectId, email, owner })
  },
  Subscription: {
    projectTitleUpdated: {
      subscribe: () => pubsub.asyncIterator('projectTitleUpdated')
    }
  }
}
