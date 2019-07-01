# for each file in examples
EXAMPLES="$(find examples -name '*.yml')"

while read  -r example;
do
  EXPECTED_STATUS="$(grep '# test exit-status' "${example}" | sed 's/# test exit-status \([0-9]*\)/\1/')"

  echo "Testing: ${example} (should be ${EXPECTED_STATUS})"

  node out/index.js --rules rules/kubernetes.yml --tag kubernetes --source ${example}

  ACTUAL_STATUS=$?

  if [[ ${ACTUAL_STATUS} != ${EXPECTED_STATUS} ]];
  then
    echo "Status does not match!"
    exit 1
  fi
done <<< "${EXAMPLES}"
# read pragmas:
#   rules
#   tags

# run