import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class AiBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the Lambda Layer for aws-sdk
    const awsSdkLayer = new lambda.LayerVersion(this, 'AwsSdkLayer', {
      code: lambda.Code.fromAsset('aws-sdk-layer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Layer with aws-sdk',
    });

    // Defining the Node.js Lambda function
    const aiLambda = new lambda.Function(this, 'LambdaFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      layers: [awsSdkLayer],
    });

    const api = new apigateway.LambdaRestApi(this, 'ApiGateway', {
      handler: aiLambda,
    });

    // Granting the Lambda permission to invoke the AI model
    aiLambda.role?.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['arn:aws:bedrock:us-east-1::foundation-model/ai21.j2-ultra-v1'],
    }));
  }
}
