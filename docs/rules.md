# Rules

Rules apply a schema fragment to a set of nodes selected from the original data.

- [Rules](#rules)
  - [Metadata](#metadata)
    - [Name](#name)
    - [Desc](#desc)
    - [Level](#level)
    - [Tags](#tags)
  - [Data](#data)
    - [Select](#select)
    - [Filter](#filter)
    - [Check](#check)

## Metadata

### Name

The rule name for running single rules.

### Desc

The rule description for error messaging.

### Level

The rule log level.

### Tags

A list of tags for the rule. Used for inclusion and exclusion.

## Data

### Select

JSON path used to select nodes from the data.

### Filter

Schema fragment used to filter selected nodes.

If a node matches the `select` path but does not match this schema, it will be skipped.

### Check

Schema fragment used to check selected nodes.

This is the real rule.
