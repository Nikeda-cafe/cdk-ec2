import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { S3Event, S3EventRecord } from 'aws-lambda';

const cloudfront = new CloudFrontClient({ region: 'us-east-1' });

interface InvalidationResult {
  statusCode: number;
  body: string;
}

export const handler = async (event: S3Event): Promise<InvalidationResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const distributionId = process.env.DISTRIBUTION_ID;
  if (!distributionId) {
    throw new Error('DISTRIBUTION_ID environment variable is not set');
  }
  
  try {
    // Get the object key from the S3 event
    const records: S3EventRecord[] = event.Records || [];
    const invalidationPaths: string[] = [];
    
    for (const record of records) {
      if (record.s3 && record.s3.object) {
        const objectKey = record.s3.object.key;
        invalidationPaths.push('/' + objectKey);
        console.log('Adding invalidation path:', '/' + objectKey);
      }
    }
    
    if (invalidationPaths.length === 0) {
      console.log('No objects to invalidate');
      return { 
        statusCode: 200, 
        body: JSON.stringify({ message: 'No objects to invalidate' })
      };
    }
    
    // Create CloudFront invalidation
    const command = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: invalidationPaths.length,
          Items: invalidationPaths
        }
      }
    });
    
    const result = await cloudfront.send(command);
    console.log('Invalidation created:', result.Invalidation?.Id);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Cache invalidation created successfully',
        invalidationId: result.Invalidation?.Id,
        paths: invalidationPaths
      })
    };
  } catch (error) {
    console.error('Error creating invalidation:', error);
    throw error;
  }
};
