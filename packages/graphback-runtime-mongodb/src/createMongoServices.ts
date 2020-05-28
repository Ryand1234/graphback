import { GraphQLObjectType, GraphQLSchema } from "graphql"
import { PubSubEngine } from 'graphql-subscriptions';
import { CRUDService, GraphbackPubSubModel } from "@graphback/runtime"
import { Db } from "mongodb"
import { MongoDBDataProvider } from "./MongoDBDataProvider";
import { OffixMongoDBDataProvider } from './OffixMongoDBDataProvider';

/**
 * Helper function for creating mongodb runtime context used in Graphback
 *
 * @param schema
 * @param db
 * @param pubSub
 */
export const createMongoCRUDRuntimeContext = (
  models: GraphbackPubSubModel[], schema: GraphQLSchema,
  db: Db, pubSub: PubSubEngine
) => {
  throw new Error("Deprecated")
}


/**
 * Helper function for creating mongodb runtime context used in Graphback
 *
 * @param schema
 * @param db
 * @param pubSub
 */
export const createOffixMongoCRUDRuntimeContext = (
  models: GraphbackPubSubModel[], schema: GraphQLSchema,
  db: Db, pubSub: PubSubEngine
) => {
  throw new Error("Deprecated")
}
