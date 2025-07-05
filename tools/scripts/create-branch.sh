#!/bin/bash

set -e  # Exit on any error

# Configuration
REPO_URL="wri/gfw-microservices"
CLONE_DIR="gfwpro-release-candidate"
DEFAULT_BRANCH="develop"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 <sprint_number> <last_pr> [cherry_picks]"
    echo
    echo "Parameters:"
    echo "  sprint_number  - Sprint number (e.g., 80)"
    echo "  last_pr        - Last PR number (e.g., 1985)"
    echo "  cherry_picks   - Optional: Comma-separated list of PRs to cherry-pick"
    echo "                   Use 'TODO: XXXX' format for pending PRs"
    echo "                   If not provided, no cherry-picks will be performed"
    echo
    echo "Examples:"
    echo "  $0 80 1985"
    echo "  $0 80 1985 '1988,1991,1995,2002,TODO: 2008,2011'"
    echo
    exit 1
}

# Function to validate inputs
validate_inputs() {
    if [[ -z "$SPRINT_NUMBER" ]]; then
        print_error "Sprint number is required"
        show_usage
    fi

    if [[ -z "$LAST_PR" ]]; then
        print_error "Last PR number is required"
        show_usage
    fi

    # Validate sprint number is numeric
    if ! [[ "$SPRINT_NUMBER" =~ ^[0-9]+$ ]]; then
        print_error "Sprint number must be numeric"
        exit 1
    fi

    # Validate last PR is numeric
    if ! [[ "$LAST_PR" =~ ^[0-9]+$ ]]; then
        print_error "Last PR number must be numeric"
        exit 1
    fi
}

# Function to check if GitHub CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed"
        print_info "Please install it from: https://cli.github.com/"
        exit 1
    fi

    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        print_error "GitHub CLI is not authenticated"
        print_info "Please run: gh auth login"
        exit 1
    fi
}

# Function to check if PR was already cherry-picked
is_pr_cherry_picked() {
    local pr_number=$1

    # Check if any commit in current branch contains the PR number
    if git log --oneline --grep="Merge pull request #${pr_number}\|#${pr_number}\|PR #${pr_number}\|PR-${pr_number}" | grep -q "${pr_number}"; then
        return 0  # Already cherry-picked
    fi
    return 1  # Not cherry-picked
}

# Function to get commit hash from PR number
get_commit_from_pr() {
    local pr_number=$1
    
    # First try to find merge commit with PR number
    local merge_commit=$(git log --oneline --grep="Merge pull request #${pr_number}" --format="%H" | head -1)
    
    if [[ -n "$merge_commit" ]]; then
        echo "$merge_commit"
        return 0
    fi
    
    # If no merge commit found, try to find any commit with PR number
    local any_commit=$(git log --oneline --grep="#${pr_number}" --format="%H" | head -1)
    
    if [[ -n "$any_commit" ]]; then
        echo "$any_commit"
        return 0
    fi
    
    # If still not found, try to find commits that mention the PR number in various formats
    local pr_commit=$(git log --oneline --grep="PR #${pr_number}\|#${pr_number}\|PR-${pr_number}" --format="%H" | head -1)
    
    if [[ -n "$pr_commit" ]]; then
        echo "$pr_commit"
        return 0
    fi
    
    return 1
}

# Function to validate cherry-pick commits before branch reset
validate_cherry_pick_commits() {
    if [[ -z "$CHERRY_PICKS" ]]; then
        return 0
    fi

    # Ensure we're on the develop branch before validating
    local current_branch=$(git branch --show-current)
    if [[ "$current_branch" != "$DEFAULT_BRANCH" ]]; then
        print_info "Switching to $DEFAULT_BRANCH for cherry-pick validation..."
        git checkout "$DEFAULT_BRANCH"
        git pull origin "$DEFAULT_BRANCH"
    fi

    print_info "Validating cherry-pick commits before branch reset..."
    echo
    
    local cherry_picks_array
    IFS=',' read -ra cherry_picks_array <<< "$CHERRY_PICKS"
    
    # Array to store valid PR numbers and their commit hashes
    declare -a VALID_CHERRY_PICKS=()
    
    for item in "${cherry_picks_array[@]}"; do
        # Remove leading/trailing whitespace
        item=$(echo "$item" | xargs)

        # Skip TODO items
        if [[ "$item" == TODO:* ]]; then
            local pr_number=$(echo "$item" | sed 's/TODO: *//')
            print_warning "Skipping TODO item: PR #${pr_number}"
            continue
        fi

        # Process regular PR numbers
        if [[ "$item" =~ ^[0-9]+$ ]]; then
            print_info "Validating PR #${item}..."
            
            # Get commit hash while still on develop branch
            local commit_hash=$(get_commit_from_pr "$item")
            
            if [[ -z "$commit_hash" ]]; then
                print_error "Could not find commit for PR #${item} - this PR may not exist or may not be merged"
                print_info "Available commits with PR numbers:"
                git log --oneline --grep="PR\|#" | head -10
                exit 1
            fi
            
            # Get commit message for better logging
            local commit_message=$(git log --format="%s" -n 1 "$commit_hash")
            print_success "PR #${item}: ${commit_hash} - ${commit_message}"
            VALID_CHERRY_PICKS+=("$item:$commit_hash")
        else
            print_warning "Invalid PR format: $item"
        fi
    done
    
    # Export the validated cherry-picks for use in process_cherry_picks
    export VALID_CHERRY_PICKS_STR=$(IFS=','; echo "${VALID_CHERRY_PICKS[*]}")
    echo
    print_success "All cherry-pick commits validated successfully"
    print_info "Total cherry-picks to process: ${#VALID_CHERRY_PICKS[@]}"
}

# Function to perform cherry-pick with pre-validated commit
cherry_pick_validated_pr() {
    local pr_number=$1
    local commit_hash=$2

    print_info "Processing PR #${pr_number}..."

    # Check if already cherry-picked
    if is_pr_cherry_picked "$pr_number"; then
        print_warning "PR #${pr_number} already cherry-picked, skipping..."
        return 0
    fi

    # Get commit message for better logging
    local commit_message=$(git log --format="%s" -n 1 "$commit_hash")
    print_info "Cherry-picking commit ${commit_hash}"
    print_info "Commit message: ${commit_message}"

    if git cherry-pick "$commit_hash"; then
        print_success "Successfully cherry-picked PR #${pr_number} (${commit_hash})"
        return 0
    else
        print_error "Failed to cherry-pick PR #${pr_number} (${commit_hash})"
        print_info "Please resolve conflicts manually and run: git cherry-pick --continue"
        return 1
    fi
}

# Function to process cherry-picks using pre-validated commits
process_cherry_picks() {
    if [[ -z "$VALID_CHERRY_PICKS_STR" ]]; then
        print_info "No cherry-picks to process"
        return 0
    fi

    print_info "Processing cherry-picks with pre-validated commits..."
    echo

    local cherry_picks_array
    IFS=',' read -ra cherry_picks_array <<< "$VALID_CHERRY_PICKS_STR"

    for item in "${cherry_picks_array[@]}"; do
        # Parse PR number and commit hash
        local pr_number=$(echo "$item" | cut -d':' -f1)
        local commit_hash=$(echo "$item" | cut -d':' -f2)
        
        print_info "Cherry-picking PR #${pr_number} (commit: ${commit_hash})..."
        
        if ! cherry_pick_validated_pr "$pr_number" "$commit_hash"; then
            print_error "Cherry-pick failed for PR #${pr_number}"
            exit 1
        fi
        echo
    done
    
    print_success "All cherry-picks completed successfully"
}

# Function to cleanup on exit
cleanup() {
    if [[ -d "$CLONE_DIR" ]]; then
        print_info "Cleaning up: deleting $CLONE_DIR"
        cd ..
        rm -rf "$CLONE_DIR"
        print_success "Cleanup completed"
    fi
}

# Set trap for cleanup on exit
trap cleanup EXIT

# Function to clone repository
clone_repository() {
    # Remove existing directory if it exists
    if [[ -d "$CLONE_DIR" ]]; then
        print_warning "Directory $CLONE_DIR already exists. Deleting it first."
        rm -rf "$CLONE_DIR"
    fi

    print_info "Cloning repository $REPO_URL into $CLONE_DIR..."
    if gh repo clone "$REPO_URL" "$CLONE_DIR"; then
        print_success "Repository cloned successfully"
    else
        print_error "Failed to clone repository"
        exit 1
    fi

    cd "$CLONE_DIR"
}

# Function to reset branch to last PR
reset_to_last_pr() {
    print_info "Resetting branch to last PR #$LAST_PR..."
    
    # Get the commit hash for the last PR
    local last_pr_commit=$(get_commit_from_pr "$LAST_PR")
    
    if [[ -z "$last_pr_commit" ]]; then
        print_error "Could not find commit for last PR #$LAST_PR"
        print_info "Available commits with PR numbers:"
        git log --oneline --grep="PR\|#" | head -10
        exit 1
    fi
    
    print_info "Resetting to commit ${last_pr_commit} (PR #$LAST_PR)..."
    
    if git reset --hard "$last_pr_commit"; then
        print_success "Successfully reset branch to PR #$LAST_PR"
    else
        print_error "Failed to reset branch to PR #$LAST_PR"
        exit 1
    fi
}

# Function to setup branch
setup_branch() {
    local current_branch=$(git branch --show-current)
    
    if [[ "$current_branch" != "$DEFAULT_BRANCH" ]]; then
        print_info "Checking out $DEFAULT_BRANCH and pulling latest changes..."
        git checkout "$DEFAULT_BRANCH"
        git pull origin "$DEFAULT_BRANCH"
    else
        print_info "Already on $DEFAULT_BRANCH, pulling latest changes..."
        git pull origin "$DEFAULT_BRANCH"
    fi

    # Create the release candidate branch
    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
        print_warning "Branch $BRANCH_NAME already exists locally. Switching to it."
        git checkout "$BRANCH_NAME"
    else
        git checkout -b "$BRANCH_NAME"
        print_success "Created branch $BRANCH_NAME"
    fi
    
    # Reset branch to last PR
    reset_to_last_pr
}

# Function to push branch
push_branch() {
    print_info "Pushing branch $BRANCH_NAME to remote..."
    if git push --force -u origin "$BRANCH_NAME"; then
        print_success "Successfully pushed $BRANCH_NAME to remote"
    else
        print_error "Failed to push branch to remote"
        exit 1
    fi
}

# Function to display summary
display_summary() {
    echo
    print_info "=== Release Candidate Summary ==="
    echo "Sprint Number: $SPRINT_NUMBER"
    echo "Last PR: $LAST_PR"
    echo "Branch Name: $BRANCH_NAME"
    echo "Cherry-picks processed: ${CHERRY_PICKS:-'None'}"
    echo "Repository: $REPO_URL"
    
    # Display cherry-pick details if any were processed
    if [[ -n "$VALID_CHERRY_PICKS_STR" ]]; then
        echo
        print_info "Cherry-pick Details:"
        local cherry_picks_array
        IFS=',' read -ra cherry_picks_array <<< "$VALID_CHERRY_PICKS_STR"
        
        for item in "${cherry_picks_array[@]}"; do
            local pr_number=$(echo "$item" | cut -d':' -f1)
            local commit_hash=$(echo "$item" | cut -d':' -f2)
            echo "  PR #${pr_number}: ${commit_hash}"
        done
    fi
    
    echo
    print_success "Release candidate branch created successfully!"

    # Get remote URL for branch link
    local remote_url=$(git remote get-url origin | sed 's/\.git$//')
    print_info "Branch URL: ${remote_url}/tree/${BRANCH_NAME}"
}

# Main execution
main() {
    print_info "=== Release Candidate Branch Creator ==="
    echo

    # Check if correct number of arguments provided
    if [[ $# -lt 2 || $# -gt 3 ]]; then
        print_error "Invalid number of arguments"
        show_usage
    fi

    # Parse command line arguments
    SPRINT_NUMBER="$1"
    LAST_PR="$2"
    CHERRY_PICKS="${3:-}"  # Set to empty string if not provided
    BRANCH_NAME="release-candidate-${SPRINT_NUMBER}"

    print_info "Configuration:"
    echo "  Sprint: $SPRINT_NUMBER"
    echo "  Last PR: $LAST_PR"
    echo "  Cherry-picks: ${CHERRY_PICKS:-'None'}"
    echo "  Branch: $BRANCH_NAME"
    echo "  Repository: $REPO_URL"
    echo "  Clone Directory: $CLONE_DIR"
    echo

    # Validate inputs
    validate_inputs

    # Check GitHub CLI
    check_gh_cli

    # Clone repository
    clone_repository

    # Validate cherry-pick commits before branch reset
    validate_cherry_pick_commits

    # Setup branch
    setup_branch

    # Process cherry-picks
    print_info "Processing cherry-picks..."
    if [[ -z "$CHERRY_PICKS" ]]; then
        print_info "No cherry-picks provided, skipping cherry-pick processing..."
    else
        process_cherry_picks
    fi

    # Push branch
    push_branch

    # Display summary
    display_summary

    # Cleanup - remove cloned repository
    print_info "Cleaning up cloned repository..."
    cd ..
    if rm -rf "$CLONE_DIR"; then
        print_success "Successfully removed $CLONE_DIR"
    else
        print_warning "Failed to remove $CLONE_DIR - you may need to remove it manually"
    fi

    print_success "Process completed successfully!"
}

# Run main function with all arguments
main "$@"
