import { aws_apigateway } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { ServiceInterface } from './service-interface';

interface ApiGatewayStackProps {
  services: ServiceInterface;
}

interface ResourceType {
  name: string;
  methods: string[];
  // child?: ResourceType;
}

export class ApiGatewayConstruct extends Construct {
  //
  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id);
    this.addResource('transaction', props);
  }

  //
  addResource(serviceName: string, { services }: ApiGatewayStackProps) {
    const apgw = new aws_apigateway.RestApi(this, `${serviceName}-Api`, {
      defaultCorsPreflightOptions: {
        allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
      },
    });

    const orderResource = this.createEndpoints(services.getOrders, apgw, {
      name: 'orders', // /orders
      methods: ['GET'],
    });

    this.addChildEndpoint(services.getOrder, orderResource, '{id}', 'GET'); // /orders/3

    const transactionResource = this.createEndpoints(
      services.getTransaction,
      apgw,
      {
        name: 'transaction', // /transaction
        methods: ['GET'],
      }
    );
  }

  createEndpoints(
    handler: IFunction, // from service via props
    resource: RestApi,
    { name, methods }: ResourceType
  ) {
    const lambdaFunction = new LambdaIntegration(handler);
    const rootResource = resource.root.addResource(name);
    methods.map((item) => {
      rootResource.addMethod(item, lambdaFunction);
    });
    return rootResource;
  }

  addChildEndpoint(
    handler: IFunction,
    resource: aws_apigateway.Resource,
    path: string,
    methodType: string
  ) {
    const lambdaFunction = new LambdaIntegration(handler);
    const childResource = resource.addResource(path);
    childResource.addMethod(methodType, lambdaFunction);
  }
}
