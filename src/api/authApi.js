import config from 'config'
import passwordGenerator from 'generate-password'

import { ManagementClient } from 'auth0'
import { getProject, addUserToProject } from '../database/projects'

const { domain, clientId, clientSecret, scope } = config.get('auth')

const management = new ManagementClient({
  domain,
  clientId,
  clientSecret,
  scope
})

const normalizeUser = ({ user_id: id, ...rest }) => ({
  id,
  ...rest
})

const userApi = {
  getUser: async (id, context) => {
    try {
      const userId = id || context.user.id
      const user = await management.getUser({ id: userId })
      return normalizeUser(user)
    } catch (err) {
      throw err
    }
  },
  getUsers: async (ids, context) => {
    try {
      let idsString = ids.join(' OR ')
      console.log(idsString)

      const users = await management.getUsers({
        q: `user_id: ${idsString}`
      })

      return users.map(user => normalizeUser(user))
    } catch (err) {
      throw err
    }
  },
  inviteUser: async ({ projectId, email, owner }, context) => {
    const connection = 'Username-Password-Authentication'

    const project = await getProject(projectId)

    if (owner.id !== project.owner) {
      throw new Error('You are not authorized to invite users to this project.')
    }

    const password = passwordGenerator.generate({
      length: 14,
      numbers: true,
      symbols: true
    })

    let user = null

    const existingUsers = await management.getUsersByEmail(email)

    if (existingUsers.length === 0) {
      user = await management.createUser({
        email,
        password,
        connection
      })
    } else {
      user = existingUsers[0]
    }

    const updatedProject = await addUserToProject(projectId, user.user_id)
    return updatedProject
  }
}

export default userApi
