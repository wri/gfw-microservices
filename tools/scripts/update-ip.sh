#!/bin/bash

# Variables
AWS_REGION="us-east-1"

usage() {
  echo "Usage: $0 -g <SECURITY_GROUP_NAME> -d <RULE_DESCRIPTION>"
  echo "A common <SECURITY_GROUP_NAME> is STD-DEVELOPMENT"
  echo "Find your <RULE_DESCRIPTION> at https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#SecurityGroups:"
  exit 1
}

# Parse command-line options
while getopts ":g:d:" opt; do
  case $opt in
    g) SECURITY_GROUP_NAME="$OPTARG"
    ;;
    d) RULE_DESCRIPTION="$OPTARG"
    ;;
    \?) echo "Invalid option -$OPTARG" >&2
    usage
    ;;
  esac
done

# Ensure required arguments are provided
if [ -z "$SECURITY_GROUP_NAME" ] || [ -z "$RULE_DESCRIPTION" ]; then
  usage
fi

# Get the current public IP with /32 CIDR format
CURRENT_PUBLIC_IP="$(curl -s ifconfig.me)/32"

# Resolve security group ID from the security group name
SECURITY_GROUP_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=$SECURITY_GROUP_NAME" \
  --query "SecurityGroups[0].GroupId" \
  --output text \
  --region "$AWS_REGION")

if [[ -z "$SECURITY_GROUP_ID" || "$SECURITY_GROUP_ID" == "None" ]]; then
  echo "Security group with name '$SECURITY_GROUP_NAME' not found in region '$AWS_REGION'."
  exit 1
fi

echo "Resolved Security Group ID: $SECURITY_GROUP_ID"

# Find the rule matching the description
SECURITY_GROUP=$(aws ec2 describe-security-groups \
  --group-ids "$SECURITY_GROUP_ID")

# Step 3: Find the rule based on the description
RULE=$(echo "$SECURITY_GROUP" | jq --arg DESCRIPTION "$RULE_DESCRIPTION" '
  .SecurityGroups[].IpPermissions[] |
  . as $permission |
  $permission.IpRanges[]? | select(.Description == $DESCRIPTION) | 
  { IpProtocol: $permission.IpProtocol, FromPort: $permission.FromPort, ToPort: $permission.ToPort, CidrIp, Description }
')

if [[ -z "$RULE" || "$RULE" == "null" ]]; then
  echo "No matching rule found with description: $RULE_DESCRIPTION"
  exit 1
fi

echo "Found rule: $RULE"

# Extract existing CIDR and port range from the matching rule
EXISTING_CIDR=$(echo "$RULE" | jq -r '.CidrIp')
FROM_PORT=$(echo "$RULE" | jq -r '.FromPort')
TO_PORT=$(echo "$RULE" | jq -r '.ToPort')
PROTOCOL=$(echo "$RULE" | jq -r '.IpProtocol')

# Revoke the old rule
echo "Revoking the old rule..."
aws ec2 revoke-security-group-ingress \
  --group-id "$SECURITY_GROUP_ID" \
  --protocol "$PROTOCOL" \
  --port "$FROM_PORT-$TO_PORT" \
  --cidr "$EXISTING_CIDR" \
  --region "$AWS_REGION" \
  > /dev/null 2>&1 # this line removes the output from terminal

# Add a new rule with the updated public IP
echo "Adding new rule with IP $CURRENT_PUBLIC_IP..."
aws ec2 authorize-security-group-ingress \
  --group-id "$SECURITY_GROUP_ID" \
  --ip-permissions "[
    {
      \"IpProtocol\": \"$PROTOCOL\",
      \"FromPort\": $FROM_PORT,
      \"ToPort\": $TO_PORT,
      \"IpRanges\": [
        {
          \"CidrIp\": \"$CURRENT_PUBLIC_IP\",
          \"Description\": \"$RULE_DESCRIPTION\"
        }
      ]
    }
  ]" \
  --region "$AWS_REGION" \
  > /dev/null 2>&1 # this line removes the output from terminal

echo "Security group rule updated successfully!"