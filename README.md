# cdk-apigateway-demo

Amazon API Gateway with `API Key` and `Usage Plan` provisioned with AWS CDK.

This CDK application creates

1. Amazon API Gateway REST API
2. A static API Key for VIP
3. A random API Key for Developer
4. Usage plans for VIP and Developer
5. Lambda function as the backend handler

# Deploy


```sh
yarn install
npx cdk diff
npx cdk deploy
```


# Validate

On deploy completed, check the `Outputs` like

```
Outputs:
my-stack-dev.DemoCommandOutputC3183AC8 = curl -H 'X-Api-Key: MEjeTT0KcL1xAApouhPqB6RgbXV7ZtYp8Re9yNbN' https://2si3rq7vzl.execute-api.ap-northeast-1.amazonaws.com/prod/greeting
my-stack-dev.DemogreetingapiEndpoint5EE3209A = https://2si3rq7vzl.execute-api.ap-northeast-1.amazonaws.com/prod/
```

Open a seperate terminal and run the full DemoCommandOutput above:

```
curl -H 'X-Api-Key: <API_KEY>' https://2si3rq7vzl.execute-api.ap-northeast-1.amazonaws.com/prod/greeting
"Hello CDK from Lambda!"                    
```
