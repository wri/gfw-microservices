#!/bin/bash

# delete-old-branches.sh - Script to delete branches older than 2 months

set -e  # Exit on any error

# Configuration
MONTHS_OLD=2
DRY_RUN=false
PROTECTED_BRANCHES=("main" "master" "develop" "development" "staging" "production")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_branch() {
    echo -e "${CYAN}[BRANCH]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --dry-run     Show what would be deleted without actually deleting"
    echo "  -m, --months N    Number of months old (default: 2)"
    echo "  -h, --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Delete branches older than 2 months"
    echo "  $0 --dry-run          # Show what would be deleted"
    echo "  $0 --months 3         # Delete branches older than 3 months"
    echo "  $0 -d -m 1            # Dry run for branches older than 1 month"
    echo ""
    echo "Protected branches (never deleted): ${PROTECTED_BRANCHES[*]}"
}

# Function to check if branch is protected
is_protected_branch() {
    local branch=$1
    for protected in "${PROTECTED_BRANCHES[@]}"; do
        if [[ "$branch" == "$protected" ]]; then
            return 0
        fi
    done
    return 1
}

# Function to get branch last commit date
get_branch_last_commit_date() {
    local branch=$1
    git log -1 --format="%ct" "$branch" 2>/dev/null || echo "0"
}

# Function to convert seconds to human readable date
seconds_to_date() {
    local seconds=$1
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        date -r "$seconds" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "Invalid date"
    else
        # Linux
        date -d "@$seconds" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "Invalid date"
    fi
}

# Function to get cutoff timestamp (2 months ago)
get_cutoff_timestamp() {
    local months_ago=$1
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        date -v-${months_ago}m +%s
    else
        # Linux
        date -d "${months_ago} months ago" +%s
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -m|--months)
            MONTHS_OLD="$2"
            if ! [[ "$MONTHS_OLD" =~ ^[0-9]+$ ]]; then
                print_error "Months must be a positive number"
                exit 1
            fi
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

print_info "🔍 Analyzing branches older than $MONTHS_OLD months..."
if [ "$DRY_RUN" = true ]; then
    print_warning "DRY RUN MODE - No branches will be deleted"
fi

# Fetch latest information from remote
print_step "Fetching latest branch information..."
git fetch --prune origin

# Get cutoff timestamp
CUTOFF_TIMESTAMP=$(get_cutoff_timestamp $MONTHS_OLD)
CUTOFF_DATE=$(seconds_to_date $CUTOFF_TIMESTAMP)

print_info "Cutoff date: $CUTOFF_DATE"
print_info "Protected branches: ${PROTECTED_BRANCHES[*]}"

echo ""

# Arrays to store branch information
LOCAL_BRANCHES_TO_DELETE=()
REMOTE_BRANCHES_TO_DELETE=()
PROTECTED_BRANCHES_FOUND=()
RECENT_BRANCHES=()

# Check local branches
print_step "Analyzing local branches..."
while IFS= read -r branch; do
    # Remove leading/trailing whitespace and asterisk
    branch=$(echo "$branch" | sed 's/^[* ]*//' | xargs)

    # Skip empty lines
    [ -z "$branch" ] && continue

    # Check if protected
    if is_protected_branch "$branch"; then
        PROTECTED_BRANCHES_FOUND+=("$branch")
        continue
    fi

    # Get last commit timestamp
    last_commit_timestamp=$(get_branch_last_commit_date "$branch")

    if [ "$last_commit_timestamp" -eq 0 ]; then
        print_warning "Could not get last commit date for local branch: $branch"
        continue
    fi

    # Check if older than cutoff
    if [ "$last_commit_timestamp" -lt "$CUTOFF_TIMESTAMP" ]; then
        last_commit_date=$(seconds_to_date $last_commit_timestamp)
        LOCAL_BRANCHES_TO_DELETE+=("$branch|$last_commit_date")
        print_branch "🗑️  LOCAL: $branch (last commit: $last_commit_date)"
    else
        last_commit_date=$(seconds_to_date $last_commit_timestamp)
        RECENT_BRANCHES+=("$branch")
    fi
done < <(git branch)

# Check remote branches
print_step "Analyzing remote branches..."
while IFS= read -r branch; do
    # Extract branch name (remove origin/ prefix)
    branch=$(echo "$branch" | sed 's/^[* ]*origin\///' | xargs)

    # Skip empty lines and HEAD
    [ -z "$branch" ] || [[ "$branch" == "HEAD" ]] && continue

    # Check if protected
    if is_protected_branch "$branch"; then
        continue
    fi

    # Get last commit timestamp
    last_commit_timestamp=$(get_branch_last_commit_date "origin/$branch")

    if [ "$last_commit_timestamp" -eq 0 ]; then
        print_warning "Could not get last commit date for remote branch: origin/$branch"
        continue
    fi

    # Check if older than cutoff
    if [ "$last_commit_timestamp" -lt "$CUTOFF_TIMESTAMP" ]; then
        last_commit_date=$(seconds_to_date $last_commit_timestamp)
        REMOTE_BRANCHES_TO_DELETE+=("$branch|$last_commit_date")
        print_branch "🗑️  REMOTE: origin/$branch (last commit: $last_commit_date)"
    fi
done < <(git branch -r)

# Summary
echo ""
print_info "=== SUMMARY ==="
print_info "Local branches to delete: ${#LOCAL_BRANCHES_TO_DELETE[@]}"
print_info "Remote branches to delete: ${#REMOTE_BRANCHES_TO_DELETE[@]}"
print_info "Protected branches found: ${#PROTECTED_BRANCHES_FOUND[@]}"
print_info "Recent branches (kept): ${#RECENT_BRANCHES[@]}"

# Show details if there are branches to delete
if [ ${#LOCAL_BRANCHES_TO_DELETE[@]} -gt 0 ] || [ ${#REMOTE_BRANCHES_TO_DELETE[@]} -gt 0 ]; then
    echo ""
    print_warning "Branches to be deleted:"

    for branch_info in "${LOCAL_BRANCHES_TO_DELETE[@]}"; do
        IFS='|' read -r branch_name last_date <<< "$branch_info"
        echo "  📍 LOCAL: $branch_name ($last_date)"
    done

    for branch_info in "${REMOTE_BRANCHES_TO_DELETE[@]}"; do
        IFS='|' read -r branch_name last_date <<< "$branch_info"
        echo "  🌐 REMOTE: origin/$branch_name ($last_date)"
    done

    if [ "$DRY_RUN" = false ]; then
        echo ""
        print_warning "⚠️  This action cannot be undone!"
        read -p "Are you sure you want to delete these branches? (y/N): " -n 1 -r
        echo

        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Operation cancelled by user"
            exit 0
        fi
    fi
else
    echo ""
    print_info "✅ No branches older than $MONTHS_OLD months found!"
    exit 0
fi

# Delete branches (if not dry run)
if [ "$DRY_RUN" = false ]; then
    echo ""
    print_step "Deleting branches..."

    DELETED_LOCAL=0
    DELETED_REMOTE=0
    FAILED_DELETIONS=()

    # Delete local branches
    for branch_info in "${LOCAL_BRANCHES_TO_DELETE[@]}"; do
        IFS='|' read -r branch_name last_date <<< "$branch_info"

        print_info "Deleting local branch: $branch_name"
        if git branch -D "$branch_name" 2>/dev/null; then
            print_info "✅ Deleted local branch: $branch_name"
            ((DELETED_LOCAL++))
        else
            print_error "❌ Failed to delete local branch: $branch_name"
            FAILED_DELETIONS+=("LOCAL: $branch_name")
        fi
    done

    # Delete remote branches
    for branch_info in "${REMOTE_BRANCHES_TO_DELETE[@]}"; do
        IFS='|' read -r branch_name last_date <<< "$branch_info"

        print_info "Deleting remote branch: origin/$branch_name"
        if git push origin --delete "$branch_name" 2>/dev/null; then
            print_info "✅ Deleted remote branch: origin/$branch_name"
            ((DELETED_REMOTE++))
        else
            print_error "❌ Failed to delete remote branch: origin/$branch_name"
            FAILED_DELETIONS+=("REMOTE: origin/$branch_name")
        fi
    done

    # Final summary
    echo ""
    print_info "🎉 DELETION COMPLETE!"
    print_info "Local branches deleted: $DELETED_LOCAL"
    print_info "Remote branches deleted: $DELETED_REMOTE"

    if [ ${#FAILED_DELETIONS[@]} -gt 0 ]; then
        print_warning "Failed deletions:"
        for failed in "${FAILED_DELETIONS[@]}"; do
            echo "  ❌ $failed"
        done
    fi

    # Clean up tracking branches
    print_step "Cleaning up stale remote tracking branches..."
    git remote prune origin

else
    echo ""
    print_info "🔍 DRY RUN COMPLETE - No branches were deleted"
    print_info "Run without --dry-run to actually delete the branches"
fi

echo ""
print_info "Script completed successfully!"