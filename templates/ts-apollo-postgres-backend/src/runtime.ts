import { GraphbackRuntime, makeResolvers, makeGraphback } from 'graphback'
import { createKnexPGCRUDRuntimeServices, PgKnexDBDataProvider } from "@graphback/runtime-knex"
import { migrateDB, MigrateOptions, removeNonSafeOperationsFilter } from 'graphql-migrations';
import { PubSub } from 'graphql-subscriptions';
import { connectDB, getConnectionDetails } from './db'
import { loadConfigSync } from 'graphql-config';
import path from 'path';
/**
 * Method used to create runtime schema
 */
export const createRuntime = () => {

  const projectConfig = loadConfigSync({
    extensions: [
      () => ({ name: 'graphback' })
    ]
  }).getDefault()

  const graphbackConfig = projectConfig.extension('graphback');
  const model = projectConfig.loadSchemaSync(path.resolve(graphbackConfig.model));

  const migrateOptions: MigrateOptions = {
    // Do not perform delete operations on tables
    operationFilter: removeNonSafeOperationsFilter
  };

  const pubSub = new PubSub();

  const dbConfig = getConnectionDetails()

  const myResolvers = makeResolvers({
    defaultDataProvider: new PgKnexDBDataProvider(dbConfig),
    pubSub
  });

  const graphback = makeGraphback({
    schema: model,
    resolvers: myResolvers
  })

  migrateDB(dbConfig, graphback.schema, migrateOptions)
    .then((ops) => {
      console.log("Migrated database");
    });

  return graphback;
}
