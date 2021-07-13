import * as apig from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import { App, CfnOutput, Construct, Stack } from '@aws-cdk/core';

export class Demo extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const handler = new lambda.Function(this, 'MyFunc', {
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: 'index.handler',
      code: new lambda.InlineCode(`
import json
def handler(event, context):
      return {
        'statusCode': 200,
        'body': json.dumps('Hello CDK from Lambda!')
      }`),
      reservedConcurrentExecutions: 100,
    });

    const api = new apig.RestApi(this, 'greeting-api');
    const greeting = api.root.addResource('greeting');
    const greetingMethod = greeting.addMethod('GET', new apig.LambdaIntegration(handler), { apiKeyRequired: true } );

    // add vip usage plan with global quota and throttle
    const vipPlan = api.addUsagePlan('VipUsagePlan', {
      quota: {
        period: apig.Period.DAY,
        limit: 10000,
      },
      throttle: {
        rateLimit: 100,
        burstLimit: 200,
      },
    });
    // add developer usage plan with global quota and throttle
    const developerPlan = api.addUsagePlan('DeveloperUsagePlan', {
      quota: {
        period: apig.Period.DAY,
        limit: 20000,
      },
      throttle: {
        rateLimit: 200,
        burstLimit: 400,
      },
    });

    // create API Key for VIP with static value
    const staticVipKeyValue = 'MEjeTT0KcL1xAApouhPqB6RgbXV7ZtYp8Re9yNbN';
    const vipKey = new apig.ApiKey(this, 'VipApiKey', {
      value: staticVipKeyValue,
    });

    // random create API Key for Developer
    const devKey = new apig.ApiKey(this, 'DevApiKey');

    vipPlan.addApiKey(vipKey);
    developerPlan.addApiKey(devKey);

    // To associate a plan to a given RestAPI stage:
    vipPlan.addApiStage({
      api,
      stage: api.deploymentStage,
      throttle: [
        {
          method: greetingMethod,
          throttle: {
            rateLimit: 10,
            burstLimit: 2,
          },
        },
      ],
    });

    const endpoint = api.deploymentStage.urlForPath('/greeting');
    new CfnOutput(this, 'CommandOutput', {
      value: `curl -H 'X-Api-Key: ${staticVipKeyValue}' ${endpoint}`,
    });
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

const stack = new Stack(app, 'my-stack-dev', { env: devEnv });

new Demo(stack, 'Demo');

app.synth();
