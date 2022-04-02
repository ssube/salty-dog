#! /bin/bash

###
# This script will template conventional commit messages based on the currently staged file names, paths, and
# branch name. Can be used as a prepare-commit-msg hook.
#
# TODO: support globs in aliases
# TODO: combine shared prefixes (src/foo/bar and src/foo/bin share src/foo)
###

declare -A SCOPE_ALIAS
SCOPE_ALIAS=(
  ['README.md']='docs'   # with extension matches raw filename, pre-filter
  ['README']='docs'      # without extension matches subdir or filename post-filter

  # build
  ['.codeclimate.yml']='build'
  ['.eslintrc.json']='build'
  ['.github']='build'
  ['.gitlab']='build'
  ['.gitlab-ci.yml']='build'
  ['.mdlrc']='build'
  ['.npmignore']='build'
  ['.npmrc']='build'
  ['Makefile']='build'
  ['renovate.json']='build'
  ['tsconfig.json']='build'
  # deps
  ['package.json']='deps'
  ['yarn.lock']='deps'
  ['vendor']='deps'
  # docs
  ['LICENSE.md']='docs'
  # image
  ['.dockerignore']='image'
  ['Dockerfile.alpine']='image'
  ['Dockerfile.stretch']='image'
)

SCOPE_ALLOW=(
  # aliases
  'build'
  'deps'
  'image'
  # dirs
  'docs'
  'rules'
  'scripts'
  'test'
  # src subdirs
  'config'
  'parser'
  'reporter'
  'rule'
  'visitor'
  # misc
  'lint'
)

function filter_scope() {
  local scope="${1}"
  local allowed="${2:-FALSE}"

  for alias in "${!SCOPE_ALIAS[@]}"
  do
    # debug_log "alias: ${alias}"
    if [[ "${alias}" == "${scope}" ]];
    then
      scope="${SCOPE_ALIAS[$alias]}"
    fi
  done

  for allow in "${SCOPE_ALLOW[@]}"
  do
    # debug_log "allow: ${allow}"
    if [[ "${allow}" == "${scope}" ]];
    then
      allowed=TRUE
    fi
  done

  if [[ ${allowed} == TRUE ]];
  then
    printf '%s' "${scope}"
  fi
}

function debug_log() {
  if [[ ! -z "${DEBUG:-}" ]];
  then
    printf '%s\n' "${@}"
  fi
}

function head_path() {
  local IFS=/
  local parts
  set -f          # Disable glob expansion
  parts=( $@ )    # Deliberately unquoted
  set +f

  if [[ ${#parts[@]} -gt 3 ]];
  then
    printf '%s/' "${parts[@]:1:2}"
  elif [[ ${#parts[@]} -gt 2 ]];
  then
    printf '%s/' "${parts[@]:1:1}"
  elif [[ ${#parts[@]} -gt 1 ]];
  then
    printf '%s/' "${parts[@]:0:1}"
  else
    printf '%s' "${parts[0]%%.*}"
  fi
}

MESSAGE_FILE="$1"
MESSAGE_SOURCE="$2"

debug_log "$(printf 'message file: %s\n' "$MESSAGE_FILE")"

MESSAGE_BODY=""
MESSAGE_TYPE=""

if [[ "${MESSAGE_FILE}" == "-" ]];
then
  printf 'message body: '
  read -e MESSAGE_BODY
else
  MESSAGE_BODY="$(cat ${MESSAGE_FILE})"
fi

# split up the existing message into segments, if any are present
if [[ "${MESSAGE_BODY}" =~ [a-z]+\([a-z\/]+\)\:[\ ]+[-a-zA-Z0-9\.\(\)]+ ]];
then
  debug_log "message is already conventional"
  exit 0
elif [[ "${MESSAGE_BODY}" =~ [a-z]+(\(\))*\:[\ ]+[-a-zA-Z0-9\.\(\)]+ ]];
then
  debug_log "message is missing scope"
  MESSAGE_TYPE="$(echo "${MESSAGE_BODY}" | sed 's/:.*$//' | sed 's/()//')"
  MESSAGE_BODY="$(echo "${MESSAGE_BODY}" | sed 's/^.*://' | sed 's/^[ ]*//')"

  debug_log "message type: ${MESSAGE_TYPE}"
  debug_log "message body: ${MESSAGE_BODY}"
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
  # pre-filter the raw path with filename
  file="$(filter_scope "$file" TRUE)"

  # reduce filenames to <= 2 segments
  path="$(head_path "$file")"
  path="${path%/}"
  debug_log "$(printf 'prefile: %s\n' "$path")"

  # post-filter truncated paths
  path="$(filter_scope "$path")"
  MODIFIED_PATHS+=("$path")

  debug_log "$(printf 'file: %s\n' "$file")"
  debug_log "$(printf 'path: %s\n' "$path")"
done <<< "${MODIFIED_FILES}"

debug_log "$(printf 'paths: %d\n' "${#MODIFIED_PATHS[@]}")"

readarray -t UNIQUE_SCOPES < <(printf '%s\n' "${MODIFIED_PATHS[@]}" | sort | uniq)

debug_log "$(printf 'unique scopes: %s\n' "${UNIQUE_SCOPES[@]}")"

# git prefix
GIT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
GIT_PREFIX="$(printf '%s\n' "${GIT_BRANCH}" | sed 's:/.*$::g')"

COMMIT_TYPE="${MESSAGE_TYPE:-${GIT_PREFIX}}"
COMMIT_MESSAGE=""

debug_log "branch: $GIT_BRANCH"
debug_log "prefix: $COMMIT_TYPE"

if [[ ${#UNIQUE_SCOPES[@]} -gt 1 ]];
then
  debug_log "many scopes"
  COMMIT_MESSAGE="${COMMIT_TYPE}: ${MESSAGE_BODY}"
else
  if [[ -z "${UNIQUE_SCOPES[0]}" ]];
  then
    debug_log "empty scope"
    COMMIT_MESSAGE="${COMMIT_TYPE}(???): ${MESSAGE_BODY}"
  else
    debug_log "single scope"
    COMMIT_MESSAGE="${COMMIT_TYPE}(${UNIQUE_SCOPES[0]}): ${MESSAGE_BODY}"
  fi
fi

debug_log "message: $COMMIT_MESSAGE"

if [[ "${MESSAGE_FILE}" == "-" ]];
then
  printf '%s\n' "${COMMIT_MESSAGE}"
else
  printf '%s' "${COMMIT_MESSAGE}" > "${MESSAGE_FILE}"
fi
