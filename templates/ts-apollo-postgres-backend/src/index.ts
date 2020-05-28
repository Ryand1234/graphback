// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config()
import { ApolloServer, PubSub } from "apollo-server-express"
import cors from "cors"
import express from "express"
import http from "http"
import { buildServices as buildGraphbackServices, buildGraphback } from 'graphback'
import { loadConfigSync } from 'graphql-config'
import path from 'path'
import { getConnectionDetails } from './db'
import { PgKnexDBDataProvider } from '@graphback/runtime-knex'
import { migrateDB, removeNonSafeOperationsFilter } from 'graphql-migrations'

const app = express()

app.use(cors())

const projectConfig = loadConfigSync({
  extensions: [
    () => ({ name: 'graphback' })
  ]
}).getDefault()

const graphbackConfig = projectConfig.extension('graphback');
const model = projectConfig.loadSchemaSync(path.resolve(graphbackConfig.model));

const pubSub = new PubSub();

const dbConfig = getConnectionDetails()

const services = buildGraphbackServices({
  defaultDataProvider: new PgKnexDBDataProvider(dbConfig),
  pubSub
})

const { typeDefs, resolvers } = buildGraphback({
  model,
  services
})

migrateDB(dbConfig, typeDefs, {
  operationFilter: removeNonSafeOperationsFilter
}).then(() => {
  console.log("Migrated database");
});

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
})

apolloServer.applyMiddleware({ app })

const httpServer = http.createServer(app)
apolloServer.installSubscriptionHandlers(httpServer)

httpServer.listen({ port: 4000 }, () => {
  console.log(`🚀  Server ready at http://localhost:4000/graphql`)
})
