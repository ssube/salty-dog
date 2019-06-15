# SALTY DOG

**S**chema **a**nalysis, **l**inting, and **t**ransformation for **Y**AML with **d**efaults, **o**ptional fields, and
other **g**ood stuff.

- [SALTY DOG](#salty-dog)
  - [Build](#build)
  - [Usage](#usage)
    - [Options](#options)
      - [Exclude Level](#exclude-level)
      - [Exclude Name](#exclude-name)
      - [Exclude Tag](#exclude-tag)
      - [Include Level](#include-level)
      - [Include Name](#include-name)
      - [Include Tag](#include-tag)
      - [Mode](#mode)
      - [Rules](#rules)
      - [Source](#source)

## Build

```shell
> git clone
> make bundle
```

## Usage

```shell
> cat rules/examples/kubernetes-require-resources-pass.yml |\
    node out/bundle.js \
      --rules rules/kubernetes.yml \
      --source - \
      --tag important
```

### Options

Excludes take priority over includes: a rule matching some of both will be excluded.

#### Exclude Level

Exclude rules by log level.

#### Exclude Name

Exclude rules by name.

#### Exclude Tag

Exclude rules by tag.

#### Include Level

Include rules by log level.

#### Include Name

Include rules by name.

#### Include Tag

- Alias: `t`, `tag`

Include rules by tag.

#### Mode

- Alias: `m`
- Default: `check`
  
The application mode.

Options:

- `check` runs each rule and exits with an indicative status
- `clean` runs each rule and updates the source data with any defaults or other changes before running the next rule

#### Rules

The path to a file containing some `rules`.

#### Source

- Alias: `s`
- Default: `-`

The source file to validate.

Defaults to stdin (`-`) to work with pipes: `cat file.yml | salty --source -`
