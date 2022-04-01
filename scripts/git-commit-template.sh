#! /bin/bash

###
# This script will template conventional commit messages based on the currently staged file names, paths, and
# branch name.
#
# TODO: scope aliases (README -> docs)
# TODO: valid scope list (filter)
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
  set -f      # Disable glob expansion
  parts=( $@ )  # Deliberately unquoted
  set +f

  if [[ ${#parts[@]} -gt 2 ]];
  then
    printf '%s/' "${parts[@]:0:2}"
  elif [[ ${#parts[@]} -gt 1 ]];
  then
    printf '%s/' "${parts[@]:0:1}"
  else
    printf "${parts[0]%%.*}"
  fi
}

MESSAGE_FILE="$1"
MESSAGE_TYPE="$2"

debug_log "$(printf 'file: %s\n' "$1")"

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

COMMIT_PREFIX="${COMMIT_PREFIX:-${GIT_PREFIX}}"

debug_log "branch: $GIT_BRANCH"
debug_log "prefix: $COMMIT_PREFIX"

DEFAULT_MESSAGE="$(cat ${MESSAGE_FILE})"
COMMIT_MESSAGE=""

if [[ ${#UNIQUE_SCOPES[@]} -gt 1 ]];
then
  debug_log "many scopes"
  COMMIT_MESSAGE="${COMMIT_PREFIX}: ${DEFAULT_MESSAGE}"
else
  debug_log "single scope"
  if [[ ! -z "${UNIQUE_SCOPES[0]}" ]];
  then
    COMMIT_MESSAGE="${COMMIT_PREFIX}(${UNIQUE_SCOPES[0]}): ${DEFAULT_MESSAGE}"
  else
    debug_log "empty scope"
    COMMIT_MESSAGE="${COMMIT_PREFIX}(???): ${DEFAULT_MESSAGE}"
  fi
fi

debug_log "message: $COMMIT_MESSAGE"

echo "${COMMIT_MESSAGE}" > "${MESSAGE_FILE}"
