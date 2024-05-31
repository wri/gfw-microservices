import json
import boto3

def lambda_handler(event, context):
    if event["source"] != "aws.ecs":
       raise ValueError("Function only supports input from events with a source type of: aws.ecs")
       
    env_name = json.loads(json.dumps(event["detail"]["overrides"]["containerOverrides"][0]["name"]))
    print('Environment: ' + env_name)
    
    if env_name == 'webserver-qa':
        sg_id = 'sg-0c7ccc850b88fa588'
    if env_name == 'webserver-staging':
        sg_id = 'sg-0c7ccc850b88fa588'
    if env_name == 'webserver-prod':
        sg_id = 'sg-0838ce5d514d6ef9c'
    if env_name == 'microservices-list-downloader-qa' or env_name == 'microservices-list-processing-qa' or env_name == 'microservices-externalapi-qa':
        sg_id = 'sg-0c7ccc850b88fa588'
    if env_name == 'microservices-list-downloader-stg' or env_name == 'microservices-list-processing-stg' or env_name == 'microservices-externalapi-stg':
        sg_id = 'sg-0c7ccc850b88fa588'
    if env_name == 'microservices-list-downloader-prod' or env_name == 'microservices-list-processing-prod' or env_name == 'microservices-externalapi-prod':
        sg_id = 'sg-0838ce5d514d6ef9c'
    
    filter=[
        {
            'Name' : 'group-id',
            'Values': [sg_id]
        }
    ]
    
    client = boto3.client('ec2')
    response = client.describe_security_group_rules(Filters=filter)
    taskarn = json.loads(json.dumps(event["detail"]["taskArn"]))
    print('TaskARN: ' + taskarn)
    
    rules = json.loads(json.dumps(response["SecurityGroupRules"]))
    for rule in rules:
        if rule.get('Description') == taskarn:
            rule_id = rule.get('SecurityGroupRuleId')
            print('Deleting rule id: ' + rule_id)
            response = client.revoke_security_group_ingress(GroupId=sg_id,SecurityGroupRuleIds=[rule_id])
    
    