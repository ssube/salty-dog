# Outline

Original rough outline document.

- Json path & schema based
- Select nodes using path
- Validate each using schema (fragment)

## Feedback & Output

- message if schema mutates fragment
- message if fragment fails schema

## Rules

### Metadata

- level (debug, info, warn, error)
- tags

### Body

- check (schema)
- filter (jsonpath)
- select (jsonpath)

## Arguments

- config file
- dest (file, stdout)
- exclude-level
- exclude-rule
- exclude-tag
- include-level
- include-rule
- include-tag
- mode (check, fix)
- rule paths
- source (file, stdin)

## Config

- should have schema and be validated
- support all arguments (except config file)
- parent config

## Run

1. Load source and copy to state
1. Load all fragments in rule paths
1. Build list of applicable rules by level, name, tag
1. For each rule:
1. Select potential nodes
1. Filter applicable nodes
1. Copy fragment
1. Apply schema
1. If schema passes and output matches, log success
1. If schema passes and output differs, log difference
1. If schema fails, log errors and mark error
1. If running in fix mode and schema passed, update state
1. After all rules:
1. If running in fix mode and all rules passed:
1. Log differences between source and state
1. Write state to dest

## Dependencies

- ajv
- jsonpath-plus
- js-yaml
