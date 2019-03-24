import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './src/graphql/definitions.graphql'
import resolvers from './src/graphql/resolvers'
import jwt from 'jsonwebtoken'
import fetch from 'node-fetch'
import { certToPEM } from './src/util/authUtil'

const PORT = 4000

const app = express()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization
        ? req.headers.authorization.split(' ')[1]
        : ''
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
      return { user }
    }
  }
})

server.applyMiddleware({ app })

app.listen(PORT, () => {
  console.log(`emojinate-server listening on port ${PORT}`)
})
