#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
# Branch name
TARGET=main-split
# Create list of commits (oldest first)
mapfile -t HASHES < <(git rev-list --reverse main)
# Create or reset target branch
git rm -rf . >/dev/null 2>&1 || true
# If target exists, switch to it and reset; otherwise create orphan
if git show-ref --verify --quiet refs/heads/$TARGET; then
  git checkout $TARGET
  git reset --hard
  git rm -rf . >/dev/null 2>&1 || true
else
  git checkout --orphan $TARGET
  git rm -rf . >/dev/null 2>&1 || true
fi
# We'll replay commits
offset_seconds=0
commit_count=0
for h in "${HASHES[@]}"; do
  echo "Processing $h"
  # Get author info and epoch
  AUTHOR_NAME=$(git show -s --format='%an' $h)
  AUTHOR_EMAIL=$(git show -s --format='%ae' $h)
  AUTHOR_TS=$(git show -s --format='%at' $h)
  # Collect files changed in this commit
  mapfile -t FILES < <(git diff-tree --no-commit-id --name-only -r $h)
  if [ ${#FILES[@]} -eq 0 ]; then
    # create an empty commit preserving author/date
    ADATE=$(date -R -d @${AUTHOR_TS})
    GIT_AUTHOR_NAME="$AUTHOR_NAME" GIT_AUTHOR_EMAIL="$AUTHOR_EMAIL" \
    GIT_AUTHOR_DATE="$ADATE" GIT_COMMITTER_DATE="$ADATE" \
      git commit --allow-empty -m "chore: project setup" || true
    commit_count=$((commit_count+1))
    continue
  fi
  # Group files by first three path components (or entire path if short)
  # Build keys list
  KEYS_TMP=$(mktemp)
  for f in "${FILES[@]}"; do
    IFS='/' read -r -a parts <<< "$f"
    if [ ${#parts[@]} -ge 3 ]; then
      key="${parts[0]}/${parts[1]}/${parts[2]}"
    elif [ ${#parts[@]} -ge 2 ]; then
      key="${parts[0]}/${parts[1]}"
    else
      key="${parts[0]}"
    fi
    printf "%s\n" "$key" >> "$KEYS_TMP"
  done
  mapfile -t sorted_keys < <(sort -u "$KEYS_TMP")
  rm -f "$KEYS_TMP"
  for key in "${sorted_keys[@]}"; do
    # get files for this key
    mapfile -t group_files < <(printf "%s\n" "${FILES[@]}" | awk -v k="$key" -F"/" '$0 ~ k {print $0}')
    # Checkout those files from the original commit
    for gf in "${group_files[@]}"; do
      git checkout $h -- "$gf" || true
    done
    # Stage them
    git add -A
    # If no staged changes, reset and continue
    if git diff --staged --quiet; then
      git reset
      continue
    fi
    # Compute author date: base original commit time + offset_seconds
    AUTHOR_TS=$(git show -s --format='%at' $h)
    CURRENT_TS=$((AUTHOR_TS + offset_seconds))
    ADATE=$(date -R -d @${CURRENT_TS})
    # Compose message heuristically from key
    scope=${key//\//_}
    MSG="feat(${scope}): add ${scope} files"
    # Commit with preserved author
    GIT_AUTHOR_NAME="$AUTHOR_NAME" GIT_AUTHOR_EMAIL="$AUTHOR_EMAIL" \
      GIT_AUTHOR_DATE="$ADATE" GIT_COMMITTER_DATE="$ADATE" \
      git commit -m "$MSG"
    commit_count=$((commit_count+1))
    offset_seconds=$((offset_seconds + 60))
  done
done
# Move refs: replace main with new branch
git branch -M $TARGET main
# Force push
git push --force-with-lease origin main
# Print summary
echo "Rewritten commits: $commit_count"
git --no-pager log --oneline -n 40
