#!/usr/bin/env bash
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"
# Backup original branch
git fetch origin || true
git branch -f main-original-backup main || true
TARGET=main-conservative
if git show-ref --verify --quiet refs/heads/$TARGET; then
  git branch -D $TARGET || true
fi
# Create orphan target
git checkout --orphan $TARGET
git rm -rf . >/dev/null 2>&1 || true
# Patterns to include (top-level source directories and specific files)
INCLUDE_PATTERNS='^(Mobile/|Workspace-backend/|admin-panel/|App\.js$|README\.md$|package.json$|src/|server\.ts$|src/)'
# Patterns to exclude
EXCLUDE_GREP='(^|/)node_modules(/|$)|(^|/)dist(/|$)|(^|/)build(/|$)|\.lock$|package-lock.json$|yarn.lock$|\.expo(/|$)|android(/|$)|ios(/|$)|\.gradle(/|$)'
# Collect commits oldest-first
mapfile -t HASHES < <(git rev-list --reverse main)
offset=0
commit_count=0
for h in "${HASHES[@]}"; do
  echo "Processing commit $h"
  AUTHOR_NAME=$(git show -s --format='%an' $h)
  AUTHOR_EMAIL=$(git show -s --format='%ae' $h)
  AUTHOR_TS=$(git show -s --format='%at' $h)
  # get changed files, filter includes and excludes
  mapfile -t FILES < <(git diff-tree --no-commit-id --name-only -r $h | grep -E "$INCLUDE_PATTERNS" || true)
  # remove excluded patterns
  if [ ${#FILES[@]} -eq 0 ]; then
    echo "  -> no source files changed (skipping)"
    continue
  fi
  # filter excluded
  filtered=()
  for f in "${FILES[@]}"; do
    if echo "$f" | grep -E "$EXCLUDE_GREP" >/dev/null; then
      continue
    fi
    filtered+=("$f")
  done
  if [ ${#filtered[@]} -eq 0 ]; then
    echo "  -> all changes were vendor/build; skipping"
    continue
  fi
  # Group by top-level directory
  declare -A groups || true
  for f in "${filtered[@]}"; do
    top=$(echo "$f" | awk -F/ '{print $1}')
    groups["$top"]+="$f\n"
  done
  # Commit each group separately
  for top in "${!groups[@]}"; do
    # Checkout files from original commit
    IFS=$'\n' read -r -d '' -a gfiles < <(printf "%s" "${groups[$top]}" && printf '\0')
    for gf in "${gfiles[@]}"; do
      git checkout $h -- "$gf" || true
    done
    git add -A
    if git diff --staged --quiet; then
      git reset
      continue
    fi
    TS=$((AUTHOR_TS + offset))
    ADATE=$(date -R -d @${TS})
    # Compose message
    case "$top" in
      Mobile) scope="mobile"; type="feat"; msg="$type($scope): mobile ${scope} changes" ;;
      Workspace-backend) scope="backend"; type="feat"; msg="$type($scope): backend ${scope} changes" ;;
      admin-panel) scope="admin"; type="feat"; msg="$type($scope): admin panel ${scope} changes" ;;
      *) scope="$top"; type="chore"; msg="$type($scope): update $scope files" ;;
    esac
    GIT_AUTHOR_NAME="$AUTHOR_NAME" GIT_AUTHOR_EMAIL="$AUTHOR_EMAIL" \
      GIT_AUTHOR_DATE="$ADATE" GIT_COMMITTER_DATE="$ADATE" \
      git commit -m "$msg"
    commit_count=$((commit_count+1))
    offset=$((offset+60))
  done
done
# Replace main
git branch -M $TARGET main
# Force push
git push --force-with-lease origin main
# Summary
echo "Rewritten commit count: $commit_count"
git --no-pager log --oneline main -n 80
