import json
import boto3

def add_sg(port, cidr_ip, desc):
    security_block = {
            'IpProtocol': 'tcp',
            'FromPort': port,
            'ToPort': port,
            'IpRanges': [
                {
                    'CidrIp': cidr_ip,
                    'Description': desc
                }
            ]   
        }
    return security_block

def lambda_handler(event, context):
    if event["source"] != "aws.ecs":
       raise ValueError("Function only supports input from events with a source type of: aws.ecs")
    
    #Get eni id from networkinterface
    attachments = json.loads(json.dumps(event["detail"]["attachments"]))
    for interface in attachments:
        if interface.get('type') == 'eni':
            for names in interface.get('details'):
                if names.get('name') == 'networkInterfaceId':
                    eni_id = names.get('value')
    print('eni_id: ' + eni_id)
    
    #Get public ip of eni_id
    eni = boto3.resource('ec2').NetworkInterface(eni_id)
    public_ip = eni.association_attribute['PublicIp']
    print('PublicIP: ' + public_ip)
    
    #build security group options
    cidr_ip = public_ip + '/32'
    desc = json.loads(json.dumps(event["detail"]["taskArn"]))
    env_name = json.loads(json.dumps(event["detail"]["overrides"]["containerOverrides"][0]["name"]))
    print('Environment: ' + env_name)
    
    # global IP Permissions to be granted
    IpPermissions=[]

    ## Security group id is the same for QA and Staging Services
    qa_staging_sg_id = 'sg-0c7ccc850b88fa588'
    prod_sg_id = 'sg-0838ce5d514d6ef9c'

    ## Default current ports are:
    port_LP = 3333
    port_EAPI = 3335
    port_LD = 3336
    port_5 = 3337
    port_6 = 3338

    if env_name == 'webserver-qa':
        IpPermissions.append(add_sg(port_LP, cidr_ip, desc))
        IpPermissions.append(add_sg(port_EAPI, cidr_ip, desc))
        IpPermissions.append(add_sg(port_LD, cidr_ip, desc))
        sg_id = qa_staging_sg_id
    if env_name == 'webserver-staging':
        IpPermissions.append(add_sg(port_LP, cidr_ip, desc))
        IpPermissions.append(add_sg(port_EAPI, cidr_ip, desc))
        IpPermissions.append(add_sg(port_LD, cidr_ip, desc))
        sg_id = qa_staging_sg_id
    if env_name == 'webserver-prod':
        IpPermissions.append(add_sg(port_LP, cidr_ip, desc))
        IpPermissions.append(add_sg(port_EAPI, cidr_ip, desc))
        IpPermissions.append(add_sg(port_LD, cidr_ip, desc))
        sg_id = prod_sg_id
    if env_name == 'microservices-list-downloader-qa' or env_name == 'microservices-list-processing-qa' or env_name == 'microservices-externalapi-qa':
        IpPermissions.append(add_sg(port_LP, cidr_ip, desc))
        IpPermissions.append(add_sg(port_EAPI, cidr_ip, desc))
        IpPermissions.append(add_sg(port_LD, cidr_ip, desc))
        sg_id = qa_staging_sg_id
    if env_name == 'microservices-list-downloader-stg' or env_name == 'microservices-list-processing-stg' or env_name == 'microservices-externalapi-stg':
        IpPermissions.append(add_sg(port_LP, cidr_ip, desc))
        IpPermissions.append(add_sg(port_EAPI, cidr_ip, desc))
        IpPermissions.append(add_sg(port_LD, cidr_ip, desc))
        sg_id = qa_staging_sg_id
    if env_name == 'microservices-list-downloader-prod' or env_name == 'microservices-list-processing-prod' or env_name == 'microservices-externalapi-prod':
        IpPermissions.append(add_sg(port_LP, cidr_ip, desc))
        IpPermissions.append(add_sg(port_EAPI, cidr_ip, desc))
        IpPermissions.append(add_sg(port_LD, cidr_ip, desc))
        sg_id = prod_sg_id
    
    #create security group
    client = boto3.client('ec2')
    
    print(IpPermissions)
    response = client.authorize_security_group_ingress(GroupId=sg_id,IpPermissions=IpPermissions)
    print(response)