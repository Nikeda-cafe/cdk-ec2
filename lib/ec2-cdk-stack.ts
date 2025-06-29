import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam'; 

const PREFIX = 'ec2-cdk';
export class Ec2CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'Ec2CdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // vpc
    // const vpc = ec2.Vpc.fromLookup(this, 'VPC', {isDefault: true});
    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', {
      isDefault: true,
    });

    // security group
    const webServerSG = new ec2.SecurityGroup(this, `${PREFIX}-web-server-sg`, { 
      vpc,
      description: 'Security group for web server',
      allowAllOutbound: true,
     })

     webServerSG.addIngressRule(
      ec2.Peer.anyIpv4(), 
      ec2.Port.tcp(22), 
      'Allow SSH'
     )

    // key pair
    const keyPair = ec2.KeyPair.fromKeyPairName(this, 'ExostingKeyPair', 'my-existing-keypair');

    // ec2 instance
    const amazonLinux2023 = ec2.MachineImage.latestAmazonLinux2023({
      edition:ec2.AmazonLinuxEdition.STANDARD,
    })

    const ec2Instance = new ec2.Instance(this, `${PREFIX}-ec2-instance`, {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: amazonLinux2023,
      securityGroup: webServerSG,
      keyPair: keyPair,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    })

    new cdk.CfnOutput(this, 'InstanceId', {
      description: 'The ID of the EC2 instance',
      value: ec2Instance.instanceId,
    })

    new cdk.CfnOutput(this, 'KeyPairName', {
      description: 'The name of the key pair',
      value: keyPair.keyPairName,
    })
    
    new cdk.CfnOutput(this, 'InstancePublicIp', {
      description: 'The public IP address of the EC2 instance',
      value: ec2Instance.instancePublicIp,
    })
  }

}
