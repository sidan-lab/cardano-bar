#!/bin/bash

# bump-version.sh - Version bumping script for cardano-bar monorepo

# Check if version number is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 0.1.0"
  exit 1
fi

VERSION=$1

# Validate version format (basic semver check)
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Version must be in format x.y.z (e.g., 0.1.0)"
  exit 1
fi

# List of package.json files to update
FILES=(
  "package.json"
  "packages/cardano-bar/package.json"
  "apps/vscode-extension/package.json"
)

echo "Updating version to $VERSION..."

# Iterate over each specified package.json file and update the version field
for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    # Update the version field
    sed -i '' -e "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" "$FILE"
    
    # Update @sidan-lab/cardano-bar dependency to the latest version
    sed -i '' -e "s/\"@sidan-lab\/cardano-bar\": \".*\"/\"@sidan-lab\/cardano-bar\": \"$VERSION\"/" "$FILE"
    
    echo "✓ Updated version in $FILE"
  else
    echo "✗ File not found: $FILE"
  fi
done

echo "Version updated to $VERSION in all specified package.json files."