import { ApolloServer } from 'apollo-server'
import typeDefs from './src/graphql/definitions.graphql'
import resolvers from './src/graphql/resolvers'
import jwt from 'jsonwebtoken'
import fetch from 'node-fetch'
import { certToPEM } from './src/util/authUtil'
import Config from 'config'

const getUserFromToken = async token => {
  const decoded = jwt.decode(token, { complete: true })
  const { keys } = await fetch(
    'https://emojinate.auth0.com/.well-known/jwks.json'
  ).then(r => r.json())
  const key = keys.find(k => k.kid === decoded.header.kid)
  const secret = certToPEM(key.x5c[0])
  const verified = jwt.verify(token, secret, { algorithm: 'RS256' })
  const user = verified
    ? {
        id: verified.sub,
        nickname: verified.nickname
      }
    : null
  return user
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
    onConnect: async (connectionParams, webSocket) => {
      if (connectionParams.authToken) {
        const user = await getUserFromToken(connectionParams.authToken)
        return { user }
      }
      throw new Error('Missing auth token!')
    }
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return connection.context
    } else if (req && req.headers.authorization) {
      const token = req.headers.authorization
        ? req.headers.authorization.split(' ')[1]
        : ''
      const user = await getUserFromToken(token)
      return { user }
    }
  },
  engine: {
    apiKey: Config.get('apollo.engine.apiKey')
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`GraphQL Server is running at: ${url}`)
  console.log(`GraphQL Subscription Server is running at: ${subscriptionsUrl}`)
})
