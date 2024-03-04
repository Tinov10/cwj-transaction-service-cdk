import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

// Standard
import { ServiceConstruct } from './service-construct';
import { ApiGatewayConstruct } from './api_gateway-construct';

// SQS
import { Topic, SubscriptionFilter } from 'aws-cdk-lib/aws-sns';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class ServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create lambdas
    const { services } = new ServiceConstruct(this, 'transaction-service', {});

    // create api
    new ApiGatewayConstruct(this, 'transaction-api-gateway', {
      services,
    });

    // import the sns topic from UserMS
    const orderTopic = Topic.fromTopicArn(
      this,
      'order_consume-Topic',
      cdk.Fn.importValue('customer-topic') // name given inside UserMS see below
    );

    // create queue
    const orderQueue = new Queue(this, 'order_queue', {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    // subscribe to SNS with SQS
    orderTopic.addSubscription(
      new SqsSubscription(orderQueue, {
        rawMessageDelivery: true,
        filterPolicy: {
          actionType: SubscriptionFilter.stringFilter({
            allowlist: ['place_order'], // we only want to filter on 'place_order'
          }),
        },
      })
    );

    // CreateOrder gets triggered by the QUEUE not by the api
    services.createOrder.addEventSource(new SqsEventSource(orderQueue));
  }
}
