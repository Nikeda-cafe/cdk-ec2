#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { Ec2CdkStack } from '../lib/ec2-cdk-stack';
import { S3CloudfrontStack } from '../lib/s3-cloudfront-stack';
import * as dotenv from 'dotenv';

dotenv.config();
const app = new cdk.App();

const account = process.env.AWS_ACCOUNT_ID;
const region = process.env.AWS_REGION;

new Ec2CdkStack(app, 'Ec2CdkStack', {
  env: {
    account: account,
    region: region,
  },
});

new S3CloudfrontStack(app, 'S3CloudfrontStack', {
  env: {
    account: account,
    region: region,
  },
});