#! /bin/bash

EXAMPLES="$(find ./examples -name '*.yml')"

while read  -r example;
do
  echo "Testing: ${example}"

  USE_RULES="$(grep '# test rules' "${example}" | sed 's/# test rules \(.*\)/\1/')"
  [[ -z "${USE_RULES}" ]] && echo "Test example must have '# test rules' pragma" && exit 1

  USE_TAGS="$(grep '# test tags' "${example}" | sed 's/# test tags \(.*\)/\1/')"
  [[ -z "${USE_TAGS}" ]] && echo "Test example must have '# test tags' pragma" && exit 1

  EXPECTED_ERRORS="$(grep '# test error-count' "${example}" | sed 's/# test error-count \([0-9]*\)/\1/')"
  [[ -z "${EXPECTED_ERRORS}" ]] && EXPECTED_ERRORS=0

  EXPECTED_STATUS="$(grep '# test exit-status' "${example}" | sed 's/# test exit-status \([0-9]*\)/\1/')"
  [[ -z "${EXPECTED_STATUS}" ]] && EXPECTED_STATUS=0

  echo "Using rules: ${USE_RULES}"
  echo "Using tags: ${USE_TAGS}"
  echo "Expected errors: ${EXPECTED_ERRORS}"
  echo "Expected status: ${EXPECTED_STATUS}"

  node out/index.js \
    --config-path ./docs \
    --config-name config-stderr.yml \
    --rules "rules/${USE_RULES}.yml" \
    --tag "${USE_TAGS}" \
    --source "${example}"

  ACTUAL_STATUS=$?

  if [[ "${ACTUAL_STATUS}" != "${EXPECTED_STATUS}" ]];
  then
    echo "Exit status does not match! (expected ${EXPECTED_STATUS}, got ${ACTUAL_STATUS})"
    exit 1
  fi
done <<< "${EXAMPLES}"

echo "All examples passed."
