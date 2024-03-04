import { IFunction } from 'aws-cdk-lib/aws-lambda';

export interface ServiceInterface {
  readonly createOrder: IFunction;
  readonly getOrder: IFunction;
  readonly getOrders: IFunction;
  readonly getTransaction: IFunction;
}
