import { GraphQLSchema } from 'graphql';
import { GraphbackPlugin, GraphbackPluginEngine, GraphbackCRUDGeneratorConfig, printSchemaWithDirectives } from '@graphback/core';
import { SchemaCRUDPlugin } from '@graphback/codegen-schema';
import { LayeredRuntimeResolverCreator } from '@graphback/runtime';
import { GraphbackServiceBuilder } from './buildServices'

export interface BuildGraphbackConfig {
  model: GraphQLSchema | string
  services: GraphbackServiceBuilder,
  crud?: GraphbackCRUDGeneratorConfig
  plugins?: GraphbackPlugin[]
}

export interface Graphback {
  typeDefs: string
  schema: GraphQLSchema
  resolvers: {
    Query: {},
    Mutation: {},
    Subscription: {}
  }
}

export function buildGraphback(config: BuildGraphbackConfig): Graphback {
  const schemaPlugins: GraphbackPlugin[] = [
    new SchemaCRUDPlugin,
    ...config.plugins || []
  ]

  const pluginEngine = new GraphbackPluginEngine({
    schema: config.model,
    plugins: schemaPlugins,
    config: { crudMethods: config.crud }
  })

  const metadata = pluginEngine.createSchema()
  const models = metadata.getModelDefinitions()

  const services = config.services.build(models)

  const runtimeResolversCreator = new LayeredRuntimeResolverCreator(models, services);

  const resolvers = runtimeResolversCreator.generate()
  const schema = metadata.getSchema()
  const typeDefs = printSchemaWithDirectives(schema)

  return {
    schema,
    typeDefs,
    resolvers
  }
}
