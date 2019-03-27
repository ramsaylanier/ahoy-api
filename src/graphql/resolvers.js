import '../database/db'
import { getProjects, getProject, createProject } from '../database/projects'
import { getTasks, createTask } from '../database/tasks'
import authApi from '../api/authApi'

export default {
  Query: {
    projects: (_, { userId }) => getProjects(userId),
    project: (_, { id }) => getProject(id),
    user: (_, { id }, context) => authApi.getUser(id, context)
  },
  User: {
    projects: user => getProjects(user.id)
  },
  Project: {
    owner: project => authApi.getUser(project.owner),
    members: project =>
      project.members ? authApi.getUsers(project.members) : [],
    tasks: project => (project.tasks ? getTasks(project.tasks) : [])
  },
  Mutation: {
    createProject: (_, { project }, { user }) => createProject(project, user),
    createTask: (_, { task }, { user }) => createTask(task, user),
    inviteUser: (_, { projectId, email }, { user: owner }) =>
      authApi.inviteUser({ projectId, email, owner })
  }
}
