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
- TODO: parent config

## Run

1. Load source and copy to state
2. Load all fragments in rule paths
3. Build list of applicable rules by level, name, tag
4. For each rule:
5. Select potential nodes
6. Filter applicable nodes
7. Copy fragment
8. Apply schema
9. If schema passes and output matches, log success
10. If schema passes and output differs, log difference
11. If schema fails, log errors and mark error
12. If running in fix mode and schema passed, update state
13. After all rules:
14. If running in fix mode and all rules passed:
15. Log differences between source and state
16. Write state to dest

## Dependencies

- ajv
- jsonpath-plus
- js-yaml
