# SALTY DOG

YAML linter/validator.

Or, as an acronym, JSON **s**chema **a**nalysis, **l**inting, and **t**ransformation for **Y**AML, featuring
**d**efaults, **o**ptional fields, and other **g**ood stuff.

- [SALTY DOG](#salty-dog)
  - [Build](#build)
  - [Usage](#usage)
    - [Validate](#validate)
      - [Validate File](#validate-file)
      - [Validate URL](#validate-url)
      - [Validate Rules](#validate-rules)
    - [Options](#options)
      - [Count](#count)
      - [Dest](#dest)
      - [Format](#format)
      - [Exclude](#exclude)
        - [Exclude Level](#exclude-level)
        - [Exclude Name](#exclude-name)
        - [Exclude Tag](#exclude-tag)
      - [Include](#include)
        - [Include Level](#include-level)
        - [Include Name](#include-name)
        - [Include Tag](#include-tag)
      - [Mode](#mode)
      - [Rules](#rules)
      - [Source](#source)

## Build

This project is written in Typescript and requires `node` and `yarn` to build.

```shell
> git clone git@github.com:ssube/salty-dog.git
> cd salty-dog
> make
```

## Usage

### Validate

`salty-dog` can validate JSON and YAML from files and streams, and emit it to a file or stream (with logs going
elsewhere).

#### Validate File

To validate a file:

```shell
> salty-dog \
    --rules rules/kubernetes.yml \
    --source rules/examples/kubernetes-require-resources-fail.yml \
    --tag important

...
[2019-06-15T23:56:04.764Z] ERROR: salty-dog/22211 on cerberus: some rules failed (errors=1)

> cat rules/examples/kubernetes-require-resources-pass.yml | salty-dog \
    --rules rules/kubernetes.yml \
    --source - \
    --tag important

...
[2019-06-15T23:53:34.223Z]  INFO: salty-dog/19839 on cerberus: all rules passed
```

#### Validate URL

To validate a URL:

```shell
> curl https://raw.githubusercontent.com/ssube/k8s-shards/master/roles/apps/gitlab/server/templates/ingress.yml | salty-dog \
    --rules rules/kubernetes.yml \
    --source - \
    --tag important | kubectl apply --dry-run -f -

...
{"name":"salty-dog","hostname":"cerberus","pid":7860,"level":30,"msg":"all rules passed","time":"2019-06-16T02:04:37.797Z","v":0}
ingress.extensions/gitlab created (dry run)
...
```

#### Validate Rules

To validate the rules in the `rules/` directory using the meta-rules:

```shell
> make run-rules

...
{"name":"salty-dog","hostname":"cerberus","pid":29403,"level":30,"msg":"all rules passed","time":"2019-06-16T00:56:55.132Z","v":0}
```

### Options

#### Count

- Alias: `c`

Exit with the error count (max of 255) rather than `0` or `1`.

#### Dest

- Alias: `d`
- Default: `-`

Path to write output data.

Defaults to stdout (`-`).

#### Format

- Default: `yaml`

Output format.

Options:

- `yaml`

#### Exclude

Excludes take priority over includes: a rule matching some of both will be excluded.

##### Exclude Level

Exclude rules by log level.

##### Exclude Name

Exclude rules by name.

##### Exclude Tag

Exclude rules by tag.

#### Include

##### Include Level

Include rules by log level.

##### Include Name

Include rules by name.

##### Include Tag

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

Defaults to stdin (`-`) to work with pipes: `cat file.yml | salty-dog --source -`
