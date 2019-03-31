import '../database/db'
import {
  getProjects,
  getProject,
  createProject,
  getProjectTasks
} from '../database/projects'
import { createTask, getTask, updateTaskOrder } from '../database/tasks'
import authApi from '../api/authApi'

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
  Mutation: {
    createProject: (_, { project }, { user }) => createProject(project, user),
    createTask: (_, { task }, { user }) => createTask(task, user),
    updateTaskOrder: (_, { id, order }, { user }) =>
      updateTaskOrder(id, order, user),
    inviteUser: (_, { projectId, email }, { user: owner }) =>
      authApi.inviteUser({ projectId, email, owner })
  }
}
