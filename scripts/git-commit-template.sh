#! /bin/bash

function debug_log() {
  if [[ ! -z "${DEBUG:-}" ]];
  then
    echo "${[@]}"
  fi
}

function head_2() {
  local IFS=/
  local foo
  set -f # Disable glob expansion
  foo=( $@ ) # Deliberately unquoted
  set +f
  #printf '%d\n' "${#foo[@]}"
  if [[ ${#foo[@]} -gt 1 ]];
  then
    printf '%s/' "${foo[@]:0:2}"
  elif [[ ${#foo[@]} -gt 0 ]];
  then
    printf "${foo[@]:0:1}"
  else
    printf ''
  fi
}

set -x

MESSAGE_FILE="$1"

debug_log "$(printf 'message: %s\n' "$1")"

# git ls-files -m for modified but unstaged
MODIFIED_FILES="$(git diff --name-only --cached)"

MODIFIED_PATHS=()

while IFS= read -r file
do
  foo="$(head_2 "$file")"
  debug_log "$(printf 'file: %s\n' "$file")"
	debug_log "$(printf 'foo: %s\n' "$foo")"
  MODIFIED_PATHS+=("$foo")
done <<< "${MODIFIED_FILES}"

debug_log "$(printf 'paths: %d\n' "${#MODIFIED_PATHS[@]}")"

readarray -t UNIQUE_PATHS < <(printf '%s\n' "${MODIFIED_PATHS[@]}" | sort | uniq)

debug_log "$(printf 'uniques: %s\n' "${UNIQUE_PATHS[@]}")"

readarray -t UNIQUE_DIRS < <(for i in ${UNIQUE_PATHS[@]}; do echo $i; done | grep -e '.*/$')

debug_log "$(printf 'dirs: %s\n' "${UNIQUE_DIRS[@]}")"

# git prefix
GIT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

BRANCH_PREFIX="$(printf '%s\n' "${GIT_BRANCH}" | sed 's:/.*$::g')"

debug_log "branch: $GIT_BRANCH"
debug_log "prefix: $BRANCH_PREFIX"

DEFAULT_MESSAGE="$(cat ${MESSAGE_FILE})"
COMMIT_MESSAGE=""

if [[ ${#UNIQUE_DIRS[@]} -gt 1 ]];
then
  debug_log "many paths"
  COMMIT_MESSAGE="${BRANCH_PREFIX}: ${DEFAULT_MESSAGE}"
else
  debug_log "single path"
  if [[ ! -z "${UNIQUE_DIRS[0]}" ]];
  then
    COMMIT_MESSAGE="${BRANCH_PREFIX}(${UNIQUE_DIRS[0]}): ${DEFAULT_MESSAGE}"
  else
    COMMIT_MESSAGE="${BRANCH_PREFIX}(???): ${DEFAULT_MESSAGE}"
  fi
fi

echo "${COMMIT_MESSAGE}" > "${MESSAGE_FILE}"
