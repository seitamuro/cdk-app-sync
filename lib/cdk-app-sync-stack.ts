import * as cdk from "aws-cdk-lib";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkAppSyncStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "CDKAppSyncTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    const api = new appsync.GraphqlApi(this, "CDKAppSyncAPI", {
      name: "cdk-appsync-api",
      schema: appsync.SchemaFile.fromAsset("graphql/schema.graphql"),
    });
    const dataSource = api.addDynamoDbDataSource("CDKAppSyncDataSource", table);

    dataSource.createResolver("AppSyncDynamoDBGetTodosResolver", {
      typeName: "Query",
      fieldName: "getTodos",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    dataSource.createResolver("AppSyncDynamoDBPostTodosResolver", {
      typeName: "Mutation",
      fieldName: "postTodo",
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        "graphql/postTodo.vtl"
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });
  }
}
