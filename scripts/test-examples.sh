#! /bin/sh

mkdir -p ./out/test/examples

EXAMPLES="$(find ./test/examples -name '*.yml')"

for example in ${EXAMPLES};
do
  echo "Testing: ${example}"

  USE_RULES="$(grep '# test rules' "${example}" | sed 's/# test rules \(.*\)/\1/')"
  [ -z "${USE_RULES}" ] && echo "Test example must have '# test rules' pragma" && exit 1

  USE_TAGS="$(grep '# test tags' "${example}" | sed 's/# test tags \(.*\)/\1/')"
  [ -z "${USE_TAGS}" ] && echo "Test example must have '# test tags' pragma" && exit 1

  EXPECTED_STATUS="$(grep '# test exit-status' "${example}" | sed 's/# test exit-status \([0-9]*\)/\1/')"
  [ -z "${EXPECTED_STATUS}" ] && EXPECTED_STATUS=0

  echo "Using rules: ${USE_RULES}"
  echo "Using tags: ${USE_TAGS}"
  echo "Expected status: ${EXPECTED_STATUS}"

  STDOUT_PATH=./out/${example}-stdout.log
  STDERR_PATH=./out/${example}-stderr.log

  node out/src/index.js \
    --config-path ./docs \
    --config-name config-stderr.yml \
    --count \
    --rules "rules/${USE_RULES}.yml" \
    --tag "${USE_TAGS}" \
    --source "${example}" \
    1> ${STDOUT_PATH} \
    2> ${STDERR_PATH}

  ACTUAL_STATUS=$?
  echo "Test status: ${ACTUAL_STATUS}"

  if [ -s ${STDOUT_PATH} ];
  then
    echo "Test output:"
    echo "==="
    echo ""
    tail -n5 ${STDOUT_PATH}
    echo ""
    echo "==="
  fi

  if [ -s ${STDERR_PATH} ];
  then
    echo "Test errors:"
    echo "==="
    echo ""
    tail -n5 ${STDERR_PATH}
    echo ""
    echo "==="
  fi

  if [ "${ACTUAL_STATUS}" != "${EXPECTED_STATUS}" ];
  then
    echo "Exit status does not match! (expected ${EXPECTED_STATUS}, got ${ACTUAL_STATUS})"
    echo "Failed in: ${example}"
    exit 1
  fi
done

echo "All examples passed."
