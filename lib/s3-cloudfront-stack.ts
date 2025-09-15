
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { BlockPublicAccess, BucketAccessControl } from 'aws-cdk-lib/aws-s3';

export class S3CloudfrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket
    const bucket = new s3.Bucket(this, 'WebAppBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      accessControl: BucketAccessControl.PRIVATE,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'WebAppDistribution', {
      defaultBehavior: {
        origin: new origins.S3BucketOrigin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    // Lambda function for CloudFront cache invalidation
    const cacheInvalidationFunction = new lambda.Function(this, 'CacheInvalidationFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/cache-invalidation'),
      environment: {
        DISTRIBUTION_ID: distribution.distributionId,
      },
      timeout: cdk.Duration.minutes(5),
    });

    // Grant CloudFront invalidation permissions to Lambda
    cacheInvalidationFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['cloudfront:CreateInvalidation'],
        resources: [`arn:aws:cloudfront::${cdk.Stack.of(this).account}:distribution/${distribution.distributionId}`],
      })
    );

    // Add S3 event notification to trigger Lambda
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(cacheInvalidationFunction)
    );

    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'DistributionDomainName', { value: distribution.distributionDomainName });
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
  }
}
