#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServiceStack } from '../lib/service-stack';

const app = new cdk.App();
new ServiceStack(app, 'TransactionServiceStack', {});
