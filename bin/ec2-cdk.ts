#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { Ec2CdkStack } from '../lib/ec2-cdk-stack';
import { S3CloudfrontStack } from '../lib/s3-cloudfront-stack';
const app = new cdk.App();

new Ec2CdkStack(app, 'Ec2CdkStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new S3CloudfrontStack(app, 'S3CloudfrontStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});