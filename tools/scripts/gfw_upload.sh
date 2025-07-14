#!/bin/bash

# Configuration
API_KEY=""
USER_EMAIL=""
BASE_URL="http://localhost:3335/api/v1"
CSV_FILE=""
ANALYSIS_ID="FCD"
TEMPLATE_ID=15
COMMODITY="cocoa generic"
CONCURRENT_REQUESTS=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Arrays to store process data
declare -a UPLOAD_IDS
declare -a LIST_IDS
declare -a PIDS

# Function to run a single upload process
run_single_upload() {
    local PROCESS_ID=$1
    local LIST_NAME="test_gust_${PROCESS_ID}_$(date +%m_%d_%H_%M)"

    echo -e "${BLUE}[Process $PROCESS_ID] Starting upload process...${NC}"

    # Step 1: Prepare upload
    echo -e "${YELLOW}[Process $PROCESS_ID] Step 1: Preparing upload...${NC}"
    PREPARE_RESPONSE=$(curl -s -L --post302 -k \
        -H "x-api-key: $API_KEY" \
        -H "Content-Type: application/json" \
        -X POST \
        --data "{
            \"userEmail\":\"$USER_EMAIL\",
            \"fileType\": \"csv\"
        }" \
        "$BASE_URL/prepare_upload?userEmail=$USER_EMAIL")

    if [ $? -ne 0 ]; then
        echo -e "${RED}[Process $PROCESS_ID] Error: Failed to prepare upload${NC}"
        return 1
    fi

    # Extract uploadId and uploadUrl from response
    UPLOAD_ID=$(echo $PREPARE_RESPONSE | grep -o '"uploadId":"[^"]*' | cut -d'"' -f4)
    UPLOAD_URL=$(echo $PREPARE_RESPONSE | grep -o '"uploadUrl":"[^"]*' | cut -d'"' -f4)

    if [ -z "$UPLOAD_ID" ] || [ -z "$UPLOAD_URL" ]; then
        echo -e "${RED}[Process $PROCESS_ID] Error: Could not extract uploadId or uploadUrl${NC}"
        return 1
    fi

    echo -e "${GREEN}[Process $PROCESS_ID] Upload ID: $UPLOAD_ID${NC}"

    # Step 2: Upload CSV file
    echo -e "${YELLOW}[Process $PROCESS_ID] Step 2: Uploading CSV file...${NC}"
    if [ ! -f "$CSV_FILE" ]; then
        echo -e "${RED}[Process $PROCESS_ID] Error: CSV file not found at $CSV_FILE${NC}"
        return 1
    fi

    curl -s -k \
        -H "Content-Type: text/csv" \
        -X PUT \
        -T "$CSV_FILE" \
        "$UPLOAD_URL" > /dev/null

    if [ $? -ne 0 ]; then
        echo -e "${RED}[Process $PROCESS_ID] Error: Failed to upload CSV file${NC}"
        return 1
    fi

    echo -e "${GREEN}[Process $PROCESS_ID] CSV file uploaded successfully${NC}"

    # Step 3: Upload the list
    echo -e "${YELLOW}[Process $PROCESS_ID] Step 3: Creating list...${NC}"
    LIST_RESPONSE=$(curl -s -L --post302 -k \
        -H "x-api-key: $API_KEY" \
        -H "Content-Type: application/json" \
        -X POST \
        --data "{
            \"userEmail\": \"$USER_EMAIL\",
            \"uploadId\": \"$UPLOAD_ID\",
            \"listName\": \"$LIST_NAME\",
            \"analysisIDs\": \"$ANALYSIS_ID\",
            \"templateId\":$TEMPLATE_ID,
            \"commodity\":\"$COMMODITY\"
        }" \
        "$BASE_URL/list/upload_new?userEmail=$USER_EMAIL")

    if [ $? -ne 0 ]; then
        echo -e "${RED}[Process $PROCESS_ID] Error: Failed to create list${NC}"
        return 1
    fi

    # Extract listId from response
    LIST_ID=$(echo $LIST_RESPONSE | grep -o '"listId":"[^"]*' | cut -d'"' -f4)

    if [ -z "$LIST_ID" ]; then
        echo -e "${RED}[Process $PROCESS_ID] Error: Could not extract listId${NC}"
        return 1
    fi

    echo -e "${GREEN}[Process $PROCESS_ID] List ID: $LIST_ID${NC}"

    # Step 4: Monitor status
    echo -e "${YELLOW}[Process $PROCESS_ID] Step 4: Monitoring analysis status...${NC}"
    STATUS="Pending"
    COUNTER=0
    MAX_ATTEMPTS=60

    while [ "$STATUS" = "Pending" ] && [ $COUNTER -lt $MAX_ATTEMPTS ]; do
        echo "[Process $PROCESS_ID] Checking status... (attempt $((COUNTER + 1)))"

        STATUS_RESPONSE=$(curl -s \
            -H "x-api-key: $API_KEY" \
            -H "Content-Type: application/json" \
            "$BASE_URL/list/$LIST_ID/analysis/$ANALYSIS_ID/status?userEmail=$USER_EMAIL")

        if [ $? -ne 0 ]; then
            echo -e "${RED}[Process $PROCESS_ID] Error: Failed to check status${NC}"
            return 1
        fi

        STATUS=$(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)

        echo "[Process $PROCESS_ID] Current status: $STATUS"

        if [ "$STATUS" = "Completed" ]; then
            echo -e "${GREEN}[Process $PROCESS_ID] Analysis completed!${NC}"

            # Extract result URL
            RESULT_URL=$(echo $STATUS_RESPONSE | grep -o '"resultUrl":"[^"]*' | cut -d'"' -f4)
            if [ -n "$RESULT_URL" ]; then
                echo -e "${GREEN}[Process $PROCESS_ID] Result URL: $RESULT_URL${NC}"
                echo -e "${YELLOW}[Process $PROCESS_ID] Download: curl -o results_${PROCESS_ID}.zip '$RESULT_URL'${NC}"
            fi
            return 0
        elif [ "$STATUS" = "Failed" ] || [ "$STATUS" = "Error" ]; then
            echo -e "${RED}[Process $PROCESS_ID] Analysis failed!${NC}"
            echo "[Process $PROCESS_ID] Response: $STATUS_RESPONSE"
            return 1
        fi

        COUNTER=$((COUNTER + 1))
        sleep 10
    done

    if [ $COUNTER -eq $MAX_ATTEMPTS ]; then
        echo -e "${RED}[Process $PROCESS_ID] Timeout: Analysis still pending${NC}"
        return 1
    fi
}

# Main execution
echo -e "${GREEN}Starting $CONCURRENT_REQUESTS concurrent GFW Pro upload processes...${NC}"

# Start concurrent processes
for i in $(seq 1 $CONCURRENT_REQUESTS); do
    echo -e "${BLUE}Starting process $i...${NC}"
    run_single_upload $i &
    PIDS[$i]=$!
    sleep 1  # Small delay to avoid overwhelming the server
done

# Wait for all processes to complete and collect results
SUCCESS_COUNT=0
FAILED_COUNT=0

for i in $(seq 1 $CONCURRENT_REQUESTS); do
    wait ${PIDS[$i]}
    EXIT_CODE=$?

    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}Process $i completed successfully${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "${RED}Process $i failed${NC}"
        FAILED_COUNT=$((FAILED_COUNT + 1))
    fi
done

# Summary
echo -e "${BLUE}=== SUMMARY ===${NC}"
echo -e "${GREEN}Successful processes: $SUCCESS_COUNT${NC}"
echo -e "${RED}Failed processes: $FAILED_COUNT${NC}"
echo -e "${YELLOW}Total processes: $CONCURRENT_REQUESTS${NC}"

if [ $SUCCESS_COUNT -eq $CONCURRENT_REQUESTS ]; then
    echo -e "${GREEN}All processes completed successfully!${NC}"
    exit 0
else
    echo -e "${YELLOW}Some processes failed. Check the logs above for details.${NC}"
    exit 1
fi
