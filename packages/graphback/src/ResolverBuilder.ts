/* eslint-disable @typescript-eslint/no-use-before-define */
import { GraphbackDataProvider, GraphbackCRUDService, CRUDService, GraphbackPubSubModel } from '@graphback/runtime';
import { PubSub, PubSubEngine } from 'graphql-subscriptions';
import { ModelDefinition } from '@graphback/core';

export interface ResolverOptions {
  defaultDataProvider: GraphbackDataProvider
  pubSub?: PubSubEngine
}

export function makeResolvers(options: ResolverOptions): ResolverBuilder {
  const builder = new ResolverBuilder(options)

  return builder
}

interface ModelDataSourceConfig {
  [modelName: string]: {
    service: GraphbackCRUDService
    provider?: GraphbackDataProvider
  }
}

// eslint-disable-next-line @typescript-eslint/tslint/config
class ResolverBuilder implements IResolverBuilder {

  private dsConfig: ModelDataSourceConfig;
  private options: ResolverOptions;
  public constructor(options: ResolverOptions) {
    this.options = {
      ...options,
      pubSub: new PubSub()
    }

    const service = new CRUDService(this.options.pubSub)
    service.setDataProvider(this.options.defaultDataProvider)

    this.dsConfig = {
      default: {
        service
      }
    };
  }

  public setDatasource(modelName: string, provider: GraphbackDataProvider): void {
    const modelConfig = this.dsConfig[modelName];
    if (modelConfig) {
      modelConfig.service.setDataProvider(provider)

      return;
    }

    this.dsConfig[modelName] = {
      service: this.dsConfig.default.service
    }

    this.dsConfig[modelName].service.setDataProvider(provider)
  }

  public setService(modelName: string, service: GraphbackCRUDService): void {
    const modelConfig = this.dsConfig[modelName];
    if (modelConfig) {
      modelConfig.service = service

      return;
    }

    this.dsConfig[modelName] = {
      service
    }
  }

  public build(models: ModelDefinition[]): { [modelName: string]: GraphbackCRUDService } {
    const modelServiceConfig: { [modelName: string]: GraphbackCRUDService } = {}

    for (const model of models) {
      const modelDsConfig = this.dsConfig[model.graphqlType.name];
      const pubSubConfig = getModelPubSubConfig(model)

      if (modelDsConfig) {
        modelServiceConfig[model.graphqlType.name] = modelDsConfig.service;
      } else {
        modelServiceConfig[model.graphqlType.name] = this.dsConfig.default.service
      }

      modelServiceConfig[model.graphqlType.name].setModelConfig(model.graphqlType, pubSubConfig)
      modelServiceConfig[model.graphqlType.name].getDataProvider().setBaseType(model.graphqlType)
    }

    return modelServiceConfig
  }
}

export interface IResolverBuilder {
  setDatasource(modelName: string, provider: GraphbackDataProvider): void;
  setService(modelName: string, service: GraphbackCRUDService): void;
  build(models: ModelDefinition[]): { [modelName: string]: GraphbackCRUDService }
}

function getModelPubSubConfig(model: ModelDefinition): GraphbackPubSubModel {
  return {
    name: model.graphqlType.name,
    pubSub: {
      publishCreate: model.crudOptions.subCreate,
      publishUpdate: model.crudOptions.subDelete,
      publishDelete: model.crudOptions.subUpdate
    }
  }
}
