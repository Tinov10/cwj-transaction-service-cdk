import 'reflect-metadata';
import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';
import { ServiceInterface } from './service-interface';

interface ServiceProps {}

export class ServiceConstruct extends Construct {
  public readonly services: ServiceInterface;

  constructor(scope: Construct, id: string, props: ServiceProps) {
    super(scope, id);

    const functionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ['aws-sdk'],
      },
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(180),
    };

    this.services = {
      createOrder: this.createHandlers(functionProps, 'createOrderHandler'),
      getOrder: this.createHandlers(functionProps, 'getOrderHandler'),
      getOrders: this.createHandlers(functionProps, 'getOrdersHandler'),
      getTransaction: this.createHandlers(
        functionProps,
        'getTransactionHandler'
      ),
    };
  }

  createHandlers(props: NodejsFunctionProps, handler: string): NodejsFunction {
    return new NodejsFunction(this, handler, {
      entry: join(__dirname, '/../src/handlers/index.ts'),
      handler: handler,
      ...props,
    });
  }
}
