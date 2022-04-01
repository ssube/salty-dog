#! /bin/bash

###
# This script will template conventional commit messages based on the currently staged file names, paths, and
# branch name. Can be used as a prepare-commit-msg hook.
#
# TODO: do not add type(scope) if one already exists in message
# TODO: replace scope aliases (README -> docs)
# TODO: filter valid scope (allow list)
###

function debug_log() {
  if [[ ! -z "${DEBUG:-}" ]];
  then
    echo "${@}"
  fi
}

function head_path() {
  local IFS=/
  local parts
  set -f          # Disable glob expansion
  parts=( $@ )    # Deliberately unquoted
  set +f

  if [[ ${#parts[@]} -gt 2 ]];
  then
    printf '%s/' "${parts[@]:0:2}"
  elif [[ ${#parts[@]} -gt 1 ]];
  then
    printf '%s/' "${parts[@]:0:1}"
  else
    printf '%s' "${parts[0]%%.*}"
  fi
}

MESSAGE_FILE="$1"
MESSAGE_TYPE="$2"

debug_log "$(printf 'message file: %s\n' "$MESSAGE_FILE")"

DEFAULT_MESSAGE="$(cat ${MESSAGE_FILE})"
DEFAULT_TYPE=""

# split up default message into segments
if [[ "${DEFAULT_MESSAGE}" =~ [a-z]+\([a-z\/]+\)\:[\ ]+[-a-zA-Z0-9\.\(\)]+ ]];
then
  debug_log "default message is already conventional"
  exit 0
elif [[ "${DEFAULT_MESSAGE}" =~ [a-z]+(\(\))*\:[\ ]+[-a-zA-Z0-9\.\(\)]+ ]];
then
  debug_log "default message is missing scope"
  DEFAULT_TYPE="$(echo "${DEFAULT_MESSAGE}" | sed 's/:.*$//' | sed 's/()//')"
  DEFAULT_MESSAGE="$(echo "${DEFAULT_MESSAGE}" | sed 's/^.*://' | sed 's/^[ ]*//')"

  debug_log "default type: ${DEFAULT_TYPE}"
  debug_log "default message: ${DEFAULT_MESSAGE}"
fi

# git ls-files -m for modified but unstaged
MODIFIED_FILES="$(git diff --name-only --cached)"

if [[ -z "${MODIFIED_FILES}" ]];
then
  debug_log "no staged files"
  exit 0
fi

MODIFIED_PATHS=()

while IFS= read -r file
do
  path="$(head_path "$file")"
  path="${path%/}"
  debug_log "$(printf 'file: %s\n' "$file")"
  debug_log "$(printf 'path: %s\n' "$path")"
  MODIFIED_PATHS+=("$path")
done <<< "${MODIFIED_FILES}"

debug_log "$(printf 'paths: %d\n' "${#MODIFIED_PATHS[@]}")"

readarray -t UNIQUE_SCOPES < <(printf '%s\n' "${MODIFIED_PATHS[@]}" | sort | uniq)

debug_log "$(printf 'unique scopes: %s\n' "${UNIQUE_SCOPES[@]}")"

# git prefix
GIT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
GIT_PREFIX="$(printf '%s\n' "${GIT_BRANCH}" | sed 's:/.*$::g')"

COMMIT_TYPE="${DEFAULT_TYPE:-${GIT_PREFIX}}"
COMMIT_MESSAGE=""

debug_log "branch: $GIT_BRANCH"
debug_log "prefix: $COMMIT_TYPE"

if [[ ${#UNIQUE_SCOPES[@]} -gt 1 ]];
then
  debug_log "many scopes"
  COMMIT_MESSAGE="${COMMIT_TYPE}: ${DEFAULT_MESSAGE}"
else
  if [[ -z "${UNIQUE_SCOPES[0]}" ]];
  then
    debug_log "empty scope"
    COMMIT_MESSAGE="${COMMIT_TYPE}(???): ${DEFAULT_MESSAGE}"
  else
    debug_log "single scope"
    COMMIT_MESSAGE="${COMMIT_TYPE}(${UNIQUE_SCOPES[0]}): ${DEFAULT_MESSAGE}"
  fi
fi

debug_log "message: $COMMIT_MESSAGE"

echo "${COMMIT_MESSAGE}" > "${MESSAGE_FILE}"
