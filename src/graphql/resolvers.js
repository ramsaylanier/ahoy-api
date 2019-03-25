import '../database/db'
import { getProjects, getProject, createProject } from '../database/projects'
import authApi from '../api/authApi'

export default {
  Query: {
    projects: (_, { userId }) => getProjects(userId),
    project: (_, { id }) => getProject(id),
    user: (_, { id }, context) => authApi.getUser(id, context)
  },
  User: {
    projects: user => {
      return getProjects(user.id)
    }
  },
  Project: {},
  Mutation: {
    createProject: (_, { project }, { user }) => createProject(project, user)
  }
}
