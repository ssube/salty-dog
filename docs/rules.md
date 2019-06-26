# Rules

Rules apply a schema fragment to a set of nodes selected from the original data.

This is a descriptive standard for rules. The enforced meta-rules for rules [are located here](../rules/salty-dog.yml).

- [Rules](#Rules)
  - [File](#File)
    - [Schema](#Schema)
      - [Env](#Env)
      - [Include](#Include)
      - [Regexp](#Regexp)
      - [Stream](#Stream)
    - [Name](#Name)
    - [Definitions](#Definitions)
    - [Rules](#Rules-1)
      - [Name](#Name-1)
      - [Desc](#Desc)
      - [Level](#Level)
      - [Tags](#Tags)
      - [Select](#Select)
      - [Filter](#Filter)
      - [Check](#Check)
  - [Module](#Module)

## File

Rules may be loaded from YAML or JSON files, using any extension.

### Schema

The default YAML schema has been extended with some custom types.

#### Env

An environment variable by name.

This can be used in CI environments to compare resources against the current job's branch, commit, or tag.

```yaml
foo: !env CI_COMMIT_SHA
```

#### Include

Include another file as a child of this key. The file must be a single document.

Relative paths are resolved from `__dirname`, but no path sanitization is done to prevent `../`. Include paths should
not be taken from user input.

#### Regexp

A regular expression in a string.

Uses standard JS syntax. Flags are supported.

```yaml
foo: !regexp /a.*b/gu
```

#### Stream

A process stream by name (key in `process`).

One of `stderr`, `stdin`, or `stdout`.

```yaml
logger:
  streams:
    - level: error
      stream: !stream stderr
```

### Name

A unique name, used for logging and as the schema `$id` for definitions.

This _should_ be truly unique, but _must_ be unique within the set of `--rules` loaded.

### Definitions

A dict of schema definitions in objects with string keys.

These are added to the Ajv schema and may be referenced by the file `name` and key:

```yaml
name: foo

definitions:
  bar:
    type: object

rules:
  - name: foobar
    check:
      type: object
      properties:
        bin:
          $ref: "foo#/definitions/bar"
```

### Rules

A list of rules.

#### Name

The rule name, used for logging and inclusion.

Must be unique within the file or module.

```yaml
rules:
  - name: foo
```

#### Desc

The rule description, used for error messages.

Some descriptive string.

```yaml
rules:
  - name: foo
    desc: foos must not overfoo
```

#### Level

The rule's log level, used for inclusion.

**TODO:** use for log messages

One of `debug`, `info`, `warn`, or `error` in a string.

```yaml
rules:
  - name: foo
    level: debug
```

#### Tags

A list of tags for the rule, used for inclusion.

```yaml
rules:
  - name: foo
    tags:
      - important
      - foo-related
      - definitely-not-bar
```

#### Select

JSON path used to select nodes from the data.

This selects a list of potential nodes to be `filter`ed and `check`ed. The default (`$`) selects the root of each
document. Selecting a subset of children allows the `check` schema to cover a small fragment of the document.

Uses [jsonpath-plus syntax](https://www.npmjs.com/package/jsonpath-plus#syntax-through-examples) in a string.

```yaml
rules:
  - name: foo
    select: '$.spec.template.spec.containers[*]'
```

#### Filter

Schema used to filter selected nodes.

If a node was `select`ed but but does not match this schema, it will be skipped and the rule will move on to the next
node.

Uses [ajv syntax](https://ajv.js.org/keywords.html) in an object.

```yaml
rules:
  - name: foo
    filter:
      # only check objects with the property bar
      type: object
      required: [bar]
```

#### Check

Schema used to check selected nodes.

This is the body of the rule. If a node does not match this schema, the rule will fail.

Uses [ajv syntax](https://ajv.js.org/keywords.html) in an object.

```yaml
rules:
  - name: foo
    check:
      type: string
```

## Module

**TODO:** load rules from `require`d modules
