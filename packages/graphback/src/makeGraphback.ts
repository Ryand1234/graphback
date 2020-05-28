import { GraphQLSchema } from 'graphql';
import { GraphbackPlugin, GraphbackPluginEngine, GraphbackCRUDGeneratorConfig, ModelDefinition } from '@graphback/core';
import { SchemaCRUDPlugin } from '@graphback/codegen-schema';
import { GraphbackPubSubModel, GraphbackDataProvider, GraphbackCRUDService, LayeredRuntimeResolverCreator } from '@graphback/runtime';
import { IResolverBuilder } from './ResolverBuilder'

export interface MakeGraphbackConfig {
  schema: GraphQLSchema | string
  resolvers: IResolverBuilder,
  crud?: GraphbackCRUDGeneratorConfig
  plugins?: GraphbackPlugin[]
}

export function makeGraphback({ schema, crud, plugins = [], resolvers }: MakeGraphbackConfig) {
  const schemaPlugins: GraphbackPlugin[] = [
    new SchemaCRUDPlugin,
    ...plugins
  ]

  const pluginEngine = new GraphbackPluginEngine({
    schema,
    plugins: schemaPlugins,
    config: { crudMethods: crud }
  })

  const metadata = pluginEngine.createSchema()
  const models = metadata.getModelDefinitions()

  const services = resolvers.build(models)

  const runtimeResolversCreator = new LayeredRuntimeResolverCreator(models, services);

  return {
    schema: metadata.getSchema(),
    resolvers: runtimeResolversCreator.generate()
  }
}
