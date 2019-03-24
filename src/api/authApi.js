import config from 'config'

import { ManagementClient } from 'auth0'

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
  getUser: async id => {
    try {
      const user = await management.getUser({ id })
      return normalizeUser(user)
    } catch (err) {
      throw err
    }
  }
}

export default userApi
