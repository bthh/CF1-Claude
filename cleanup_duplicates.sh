#!/bin/bash

# CF1 Project Duplicate File Cleanup Script
# This script removes duplicate files identified in the CF1 project

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default mode is dry-run for safety
DRY_RUN=true

# Parse command line arguments
if [[ "$1" == "--execute" ]]; then
    DRY_RUN=false
    echo -e "${RED}WARNING: EXECUTE mode enabled. Files will be permanently deleted!${NC}"
    read -p "Are you sure you want to proceed? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo "Operation cancelled."
        exit 0
    fi
else
    echo -e "${YELLOW}DRY RUN MODE: No files will be deleted. Use --execute to actually delete files.${NC}"
fi

# Function to safely remove files
remove_file() {
    local file="$1"
    if [[ -f "$file" ]]; then
        if [[ "$DRY_RUN" == true ]]; then
            echo -e "${YELLOW}[DRY RUN] Would delete: $file${NC}"
        else
            rm "$file" && echo -e "${GREEN}Deleted: $file${NC}" || echo -e "${RED}Failed to delete: $file${NC}"
        fi
    else
        echo -e "${RED}File not found: $file${NC}"
    fi
}

# Function to count files before cleanup
count_files() {
    local count=0
    
    # Count Zone.Identifier files
    while IFS= read -r -d '' file; do
        ((count++))
    done < <(find "/home/test/CF1" -name "*:Zone.Identifier" -print0 2>/dev/null)
    
    echo "Found $count Zone.Identifier files"
    
    # Count backup files (excluding the latest)
    local backup_count=0
    for i in {1..5}; do
        if [[ -f "/home/test/CF1/CF1 Claude/CF1 Backups/CF1 BU 4_29 ${i}_4.docx" ]]; then
            ((backup_count++))
        fi
    done
    echo "Found $backup_count old backup files to remove"
    
    echo "Total files to be removed: $((count + backup_count))"
}

echo "=== CF1 Project Duplicate File Cleanup ==="
echo

# Count files that will be affected
count_files
echo

echo "Starting cleanup process..."
echo

# 1. Remove all Zone.Identifier files
echo "1. Removing Zone.Identifier files..."
find "/home/test/CF1" -name "*:Zone.Identifier" -print0 2>/dev/null | while IFS= read -r -d '' file; do
    remove_file "$file"
done

echo

# 2. Remove old backup files (keep only the latest CF1 BU 4_29 6_6.docx)
echo "2. Consolidating backup files (keeping only the latest version)..."

# Remove backup files 1-5, keep 6
for i in {1..5}; do
    backup_file="/home/test/CF1/CF1 Claude/CF1 Backups/CF1 BU 4_29 ${i}_4.docx"
    remove_file "$backup_file"
done

echo

# Summary
echo "=== Cleanup Summary ==="
if [[ "$DRY_RUN" == true ]]; then
    echo -e "${YELLOW}DRY RUN completed. No files were actually deleted.${NC}"
    echo "To execute the cleanup, run: $0 --execute"
else
    echo -e "${GREEN}Cleanup completed successfully!${NC}"
fi

echo
echo "=== Files preserved ==="
echo "✓ Latest backup: CF1 BU 4_29 6_6.docx"
echo "✓ Master backup: cf1_master_backup_v4.zip"
echo "✓ All project code and documentation"

echo
echo "=== Manual review recommended ==="
echo "- Compare cf1-core/ vs CF5.zip contents for project structure duplicates"
echo "- Review version files (v1 vs v2) in CF1 Code and CF1 Docs"
echo "- Extract and analyze bundle zip files for potential duplicates"