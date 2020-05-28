import { GraphQLObjectType, GraphQLSchema } from "graphql"
import { PubSubEngine } from 'graphql-subscriptions';
import * as Knex from 'knex';
import { CRUDService, GraphbackPubSubModel } from "@graphback/runtime"
import { PgKnexDBDataProvider } from './PgKnexDBDataProvider';
import { KnexDBDataProvider } from './KnexDBDataProvider';

/**
 * Helper function for creating array of datasources based on the model files that will
 * be able to connect to Postgres database using knex
 *
 * @param schema
 * @param db
 * @param pubSub
 */
export const createKnexPGCRUDRuntimeServices = (
  models: GraphbackPubSubModel[], schema: GraphQLSchema,
  db: Knex, pubSub: PubSubEngine
) => {
  throw new Error("Deprecated")
}


/**
 * Helper function for creating array of datasources based on the model files that will
 * be able to connect to MySQL database using knex
 *
 * @param schema
 * @param db
 * @param pubSub
 */
export const createKnexCRUDRuntimeServices = (
  models: GraphbackPubSubModel[], schema: GraphQLSchema,
  db: Knex, pubSub: PubSubEngine
) => {
  throw new Error("Deprecated")
}
