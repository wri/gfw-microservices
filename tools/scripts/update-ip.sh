#!/bin/bash

# You will need AWS CLI and jq installed
if ! command -v aws &> /dev/null || ! command -v jq &> /dev/null; then
  echo "Error: AWS CLI and jq must be installed." >&2
  exit 1
fi

AWS_REGION="us-east-1"
SECURITY_GROUPS=()

usage() {
  echo "Usage: $0 -d <RULE_DESCRIPTION> -g <SECURITY_GROUP1,SECURITY_GROUP2,...>"
  echo "Usage: $0 -d \"Guilherme\" -g \"STD-DEVELOPMENT,STD-V2-WINDOWS\""
  exit 1
}

while getopts ":d:g:" opt; do
  case $opt in
    d) RULE_DESCRIPTION="$OPTARG" ;;
    g) IFS=',' read -r -a SECURITY_GROUPS <<< "$OPTARG" ;;
    \?) echo "Invalid option -$OPTARG" >&2
        usage ;;
  esac
done

if [ -z "$RULE_DESCRIPTION" ] || [ ${#SECURITY_GROUPS[@]} -eq 0 ]; then
  usage
fi

# Fetch current public IPv4 address
CURRENT_PUBLIC_IP=$(curl -4 -s https://checkip.amazonaws.com 2>/dev/null | tr -d '[:space:]')
if [ -z "$CURRENT_PUBLIC_IP" ]; then
  CURRENT_PUBLIC_IP=$(curl -4 -s https://api4.ipify.org 2>/dev/null | tr -d '[:space:]')
fi
if [ -z "$CURRENT_PUBLIC_IP" ]; then
  echo "Error: Could not determine public IPv4 address." >&2
  exit 1
fi
# Validate IPv4 format to catch unexpected responses (e.g. IPv6)
if ! echo "$CURRENT_PUBLIC_IP" | grep -Eq '^([0-9]{1,3}\.){3}[0-9]{1,3}$'; then
  echo "Error: Retrieved IP '$CURRENT_PUBLIC_IP' is not a valid IPv4 address." >&2
  exit 1
fi
CURRENT_PUBLIC_IP="${CURRENT_PUBLIC_IP}/32"

for SECURITY_GROUP_NAME in "${SECURITY_GROUPS[@]}"; do
  echo "Processing security group: $SECURITY_GROUP_NAME"

  # Fetch security group information once
  SECURITY_GROUP_INFO=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=$SECURITY_GROUP_NAME" --region "$AWS_REGION")

  SECURITY_GROUP_ID=$(echo "$SECURITY_GROUP_INFO" | jq -r '.SecurityGroups[0].GroupId')

  if [ -z "$SECURITY_GROUP_ID" ] || [ "$SECURITY_GROUP_ID" == "null" ]; then
    echo "Security group '$SECURITY_GROUP_NAME' not found. Skipping..." >&2
    continue
  fi

  echo "Resolved Security Group ID: $SECURITY_GROUP_ID"

  # Find all matching rules
  MATCHING_RULES=$(echo "$SECURITY_GROUP_INFO" | jq --arg DESCRIPTION "$RULE_DESCRIPTION" '
    .SecurityGroups[].IpPermissions[] |
    . as $permission |
    $permission.IpRanges[]? | select(.Description == $DESCRIPTION) |
    {
      IpProtocol: $permission.IpProtocol,
      FromPort: $permission.FromPort,
      ToPort: $permission.ToPort,
      CidrIp,
      Description
    }')

  if [[ -z "$MATCHING_RULES" || "$MATCHING_RULES" == "null" ]]; then
    echo "No matching rules found for description: $RULE_DESCRIPTION in $SECURITY_GROUP_NAME"
    continue
  fi

  echo "Found matching rules: $MATCHING_RULES"

  while IFS= read -r RULE; do
    EXISTING_CIDR=$(echo "$RULE" | jq -r '.CidrIp')
    FROM_PORT=$(echo "$RULE" | jq -r '.FromPort')
    TO_PORT=$(echo "$RULE" | jq -r '.ToPort')
    PROTOCOL=$(echo "$RULE" | jq -r '.IpProtocol')

    if [[ "$EXISTING_CIDR" == "$CURRENT_PUBLIC_IP" ]]; then
      echo "IP already up-to-date for $SECURITY_GROUP_NAME. Skipping..."
      continue
    fi

    echo "Revoking old rule ($EXISTING_CIDR) in $SECURITY_GROUP_NAME..."
    aws ec2 revoke-security-group-ingress \
      --group-id "$SECURITY_GROUP_ID" \
      --protocol "$PROTOCOL" \
      --port "$FROM_PORT-$TO_PORT" \
      --cidr "$EXISTING_CIDR" \
      --region "$AWS_REGION" \
      > /dev/null 2>&1

    if [ $? -ne 0 ]; then
      echo "$(date +"%Y-%m-%d %H:%M:%S") - Error executing AWS CLI command. Skipping..." >&2
      continue
    fi

    echo "Adding new rule with IP $CURRENT_PUBLIC_IP to $SECURITY_GROUP_NAME..."
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
      > /dev/null 2>&1

    if [ $? -ne 0 ]; then
      echo "$(date +"%Y-%m-%d %H:%M:%S") - Error executing AWS CLI command. Skipping..." >&2
      continue
    fi

    echo "Security group rule updated successfully for $SECURITY_GROUP_NAME!"
  done <<< "$(echo "$MATCHING_RULES" | jq -c '.')"

done