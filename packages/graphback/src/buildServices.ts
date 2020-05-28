/* eslint-disable @typescript-eslint/no-use-before-define */
import { GraphbackDataProvider, GraphbackCRUDService, CRUDService, GraphbackPubSubModel } from '@graphback/runtime';
import { PubSub, PubSubEngine } from 'graphql-subscriptions';
import { ModelDefinition } from '@graphback/core';

export interface ServiceBuilderConfig {
  defaultDataProvider: GraphbackDataProvider
  pubSub?: PubSubEngine
}

export function buildGraphbackServices(options: ServiceBuilderConfig): GraphbackServiceBuilder {
  const builder = new ServiceBuilder(options)

  return builder
}

interface ModelDataSourceConfig {
  [modelName: string]: {
    service: GraphbackCRUDService
    provider?: GraphbackDataProvider
  }
}

// eslint-disable-next-line @typescript-eslint/tslint/config
class ServiceBuilder implements GraphbackServiceBuilder {
  private datasourceConfig: ModelDataSourceConfig;
  private options: ServiceBuilderConfig;
  public constructor(builderConfig: ServiceBuilderConfig) {
    this.options = {
      ...builderConfig,
      pubSub: new PubSub()
    }

    const service = new CRUDService(this.options.pubSub)
    service.setDataProvider(this.options.defaultDataProvider)

    this.datasourceConfig = {
      default: {
        service
      }
    };
  }

  public setDatasource(modelName: string, provider: GraphbackDataProvider): void {
    const modelConfig = this.datasourceConfig[modelName];
    if (modelConfig) {
      modelConfig.service.setDataProvider(provider)

      return;
    }

    this.datasourceConfig[modelName] = {
      service: this.datasourceConfig.default.service
    }

    this.datasourceConfig[modelName].service.setDataProvider(provider)
  }

  public setService(modelName: string, service: GraphbackCRUDService): void {
    const modelConfig = this.datasourceConfig[modelName];
    if (modelConfig) {
      modelConfig.service = service

      return;
    }

    this.datasourceConfig[modelName] = {
      service
    }
  }

  public build(models: ModelDefinition[]): { [modelName: string]: GraphbackCRUDService } {
    const modelServiceConfig: { [modelName: string]: GraphbackCRUDService } = {}

    for (const model of models) {
      const modelDsConfig = this.datasourceConfig[model.graphqlType.name];
      const pubSubConfig = this.getModelPubSubConfig(model)

      if (modelDsConfig) {
        modelServiceConfig[model.graphqlType.name] = modelDsConfig.service;
      } else {
        modelServiceConfig[model.graphqlType.name] = this.datasourceConfig.default.service
      }

      modelServiceConfig[model.graphqlType.name].setModelConfig(model.graphqlType, pubSubConfig)
      modelServiceConfig[model.graphqlType.name].getDataProvider().setBaseType(model.graphqlType)
    }

    return modelServiceConfig
  }

  private getModelPubSubConfig(model: ModelDefinition): GraphbackPubSubModel {
    return {
      name: model.graphqlType.name,
      pubSub: {
        publishCreate: model.crudOptions.subCreate,
        publishUpdate: model.crudOptions.subDelete,
        publishDelete: model.crudOptions.subUpdate
      }
    }
  }
}

export interface GraphbackServiceBuilder {
  setDatasource(modelName: string, provider: GraphbackDataProvider): void;
  setService(modelName: string, service: GraphbackCRUDService): void;
  build(models: ModelDefinition[]): { [modelName: string]: GraphbackCRUDService }
}
