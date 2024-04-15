#!/bin/bash
# Load environment variables from .env file
# This file should be in the same directory as the script
# The .env file should contain the following variables:
# BASE_API_URL=https://env.globalforestwatch.org/v1/api/
# USER_EMAIL=john.c.calhoun@examplepetstore.com
# API_TOKEN=your-api-token

if [ -f .env ]
then
  export $(cat .env | xargs)
fi

# Define API details
BASE_URL=$BASE_API_URL
USER_EMAIL=$USER_EMAIL
API_TOKEN=$API_TOKEN

if [ -z "$API_TOKEN" ]; then
  echo "Error: API_TOKEN is not set"
  exit 1
fi

if [ -z "$USER_EMAIL" ]; then
  echo "Error: USER_EMAIL is not set"
  exit 1
fi

if [ -z "$BASE_URL" ]; then
  echo "Error: BASE_URL is not set"
  exit 1
fi

# Function to make API requests and handle errors
post_api_request() {
    local response
    response=$(curl -L --post302 -k -H "x-api-key: ${API_TOKEN}" \
    --header "Content-Type: application/json" \
    -X POST --data "$1" $2)
    if [[ $? -ne 0 ]]; then
        echo "Error: Failed to make API request"
        exit 1
    fi
    echo "$response"
}

# Make API call to prepare upload
prepare_upload_response=$(post_api_request \
    "{\"userEmail\": \"$USER_EMAIL\", \"fileType\": \"csv\"}" \
    "${BASE_URL}prepare_upload")

echo "Prepare upload response: $prepare_upload_response"

uploadUrl=$(echo "$prepare_upload_response" | jq -r '.uploadUrl')
uploadId=$(echo "$prepare_upload_response" | jq -r '.uploadId')

echo $uploadUrl

# Get the current directory
current_directory=$(pwd)

# Concatenate with the file name to generate the path to the file
file_path="${current_directory}/CocoaGeneric3.csv"
echo $file_path

# Upload the file to s3
response=$(curl -k --header "Content-Type: text/csv" -X PUT -T "$file_path" "$uploadUrl")

# Check if the response is successful (status code 200)
# if [ "$response" -ne 200 ]; then
#   echo "Error uploading file"
#   exit 1
# fi

# Create a list and trigger the analysis
list_response=$(post_api_request \
              "{\"uploadId\": \"$uploadId\", \"listName\": \"TestList000$uploadId\", \"templateId\": 13, \"analysisIDs\": \"Alerts\"}"\
              "${BASE_URL}list/upload_new")

echo $list_response

# Check the status of the analysis
listId=$(echo "$list_response" | jq -r '.listId')
response=$(curl -L -k -H "x-api-key: ${API_TOKEN}" "${BASE_URL}list/${listId}/analysis/Alerts/status")
echo $response

# Wait for the analysis change in case changed
sleep 10
response=$(curl -L -k -H "x-api-key: ${API_TOKEN}" "${BASE_URL}list/${listId}/analysis/Alerts/status")