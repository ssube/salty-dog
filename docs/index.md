# Salty Dog

`salty-dog` is a tool to validate JSON and YAML data using JSON schema rules. It can filter elements and validate
select parts of the document, supports multiple documents in the same stream or file, and can insert defaults during
validation.

## Getting Started

`salty-dog` is distributed as both a Docker container and an npm package, so it can be installed or pulled:

```shell
# docker image
> docker pull ssube/salty-dog:master

# npm project install
> yarn add -D salty-dog

# npm global install
> yarn global add salty-dog
```

**Note:** while the container is the preferred way of running `salty-dog`, it has a serious limitation: `docker run`
combines `stdout` and `stderr`, making it difficult to separate logs and the output document. Writing either the logs
or data to a file works around this.

To download, validate, and apply a Kubernetes resource:

```shell
> curl https://raw.githubusercontent.com/ssube/k8s-shards/master/roles/apps/gitlab/server/templates/ingress.yml | \
    salty-dog \
      --rules rules/kubernetes.yml \
      --source - \
      --tag kubernetes | \
    kubectl apply --dry-run -f -

...
{"name":"salty-dog","hostname":"cerberus","pid":7860,"level":30,"msg":"all rules passed","time":"2019-06-16T02:04:37.797Z","v":0}
ingress.extensions/gitlab created (dry run)
```

## Contents

- [Salty Dog](#salty-dog)
  - [Getting Started](#getting-started)
  - [Contents](#contents)
  - [Build](#build)
    - [Local Build](#local-build)
    - [Container Build](#container-build)
  - [Usage](#usage)
    - [Using The Container](#using-the-container)
    - [Using The Package](#using-the-package)
      - [Project Package](#project-package)
      - [Global Package](#global-package)
    - [Usage Modes](#usage-modes)
  - [Rules](#rules)
    - [Loading Rule Sources](#loading-rule-sources)
    - [Using Rule Tags](#using-rule-tags)
    - [Validating Rules](#validating-rules)
  - [Output](#output)
    - [Using Data Output](#using-data-output)
      - [Inserting Default Values](#inserting-default-values)
    - [Formatting Log Output](#formatting-log-output)

## Build

### Local Build

`salty-dog` is written in Typescript and requires `make`, `node`, and `yarn` to build.

```shell
> git clone git@github.com:ssube/salty-dog.git
> cd salty-dog
> make
```

After building, run with `node out/index.js` or install globally with `make yarn-global`.

`make` targets are provided for some example arguments:

```shell
> curl https://raw.githubusercontent.com/ssube/k8s-shards/master/roles/apps/gitlab/server/templates/ingress.yml | \
    make run-stream \
    1> >(kubectl apply --dry-run -f -) \
    2> >($(yarn bin)/bunyan)

...
[2019-06-16T03:23:56.645Z]  INFO: salty-dog/8015 on cerberus: all rules passed
ingress.extensions/gitlab created (dry run)
```

### Container Build

This method does not require the usual dependencies to be installed, only `docker` itself.

Build with Docker:

```shell
# Stretch
docker run --rm -v "$(pwd):/salty-dog" -w /salty-dog node:16-stretch make
docker build -t salty-dog:stretch -f Dockerfile.stretch .

# Alpine
docker run --rm -v "$(pwd):/salty-dog" -w /salty-dog node:16-alpine sh -c "apk add build-base && make"
docker build -t salty-dog:alpine -f Dockerfile.alpine .
```

## Usage

`salty-dog` is distributed as a docker container and an npm package.

While the container is the preferred way of running `salty-dog`, it has one limitation: `docker run` combines
`stdout` and `stderr`, making it impossible to separate logs and the output document. Writing either the logs or dest
to a file works around this.

### Using The Container

To run the Docker container: `docker run --rm ssube/salty-dog:master`

The latest semi-stable image is published to `ssube/salty-dog:master`. Containers are published based on both Alpine
Linux and Debian (currently Stretch). All of the [available tags are listed here](https://hub.docker.com/r/ssube/salty-dog/tags).

Rules are provided in the image at `/salty-dog/rules`. To use custom rules in the container, mount them with
`-v $(pwd)/rules:/salty-dog/rules:ro` and load them with `--rules /rules/foo.yml`.

The `ssube/salty-dog` container image can be run normally or interactively.

To validate a file or input normally:

```shell
> docker run --rm ssube/salty-dog:master --help
```

You can also launch a shell within the container, using local rules:

```shell
> docker run \
    --rm \
    -it \
    --entrypoint bash \
    ssube/salty-dog:master
```

### Using The Package

`salty-dog` is also published as [an npm package](https://www.npmjs.com/package/salty-dog) with a binary, so it can
be used as a CLI command or programmatically.

#### Project Package

To install `salty-dog` for the current project:

```shell
> yarn add -D salty-dog
> $(yarn bin)/salty-dog --help
```

#### Global Package

It is also possible to install `salty-dog` globally, rather than within a project. However, this is
not recommended.

```shell
> yarn global add salty-dog
> export PATH="${PATH}:$(yarn global bin)"
> salty-dog --help
```

### Usage Modes

TODO

## Rules

Rules are the core of `salty-dog` validation. Each rule has a JSON schema used to `check` the data, an optional
`filter` to skip some data, and a name and description.

For example:

```yaml
name: salty-dog-gitlab-ci
rules:
  - name: gitlab-stages
    desc: should specify stages
    level: info
    tags:
      - gitlab
      - optional
    check:
      type: object
      required: [stages]
      properties:
        stages:
          type: array
          items:
            type: string
```

The complete rule format [is documented here](./rules.md).

Rules combine a jsonpath expression and JSON schema to select and validate the document.

The rule's `select` expression is used to select nodes that should be validated, which are `filter`ed, then `check`ed.

The structure of rule files and the rules within them [are documented here](docs/rules.md).

### Loading Rule Sources

Rules can be loaded from a file, module, or path.

To load a file by name, `--rule-file foo.yml`. This will accept any extension.

To load a module, `--rule-module foo`. The required module exports [are documented here](./docs/rules.md#from-module).

To load a path, `--rule-path foo/`. This will recursively load any files matching `*.+(json|yaml|yml)`.

### Using Rule Tags

All rules are disabled by default and must be enabled by name, level, or tag.

To enable a single rule by name, `--include-name foo-rule`.

To enable a group of rules by level, `--include-level warn`.

To enable a group of rules by tag, `--include-tag foo`.

### Validating Rules

To validate the rules in the `rules/` directory using the meta-rules:

```shell
> make test-rules

...
{"name":"salty-dog","hostname":"cerberus","pid":29403,"level":30,"msg":"all rules passed","time":"2019-06-16T00:56:55.132Z","v":0}
```

## Output

`salty-dog` outputs two streams: valid input data and error logs.

### Using Data Output

Valid input data is written back out to `stdout`, allowing `salty-dog` to be used inline with piped shell commands.

For example, to validate a kubernetes resource before applying it:

```shell
> curl https://raw.githubusercontent.com/ssube/k8s-shards/master/roles/apps/gitlab/server/templates/ingress.yml | \
    salty-dog \
      --rules rules/kubernetes.yml \
      --source - \
      --tag kubernetes | \
    kubectl apply --dry-run -f -

...
{"name":"salty-dog","hostname":"cerberus","pid":7860,"level":30,"msg":"all rules passed","time":"2019-06-16T02:04:37.797Z","v":0}
ingress.extensions/gitlab created (dry run)
```

#### Inserting Default Values

Properties that appear in the schema with the `default` key set will be added to each element as it is checked. Rules
apply in order, as do their defaults.

### Formatting Log Output

`salty-dog` uses [node-bunyan](https://github.com/trentm/node-bunyan) for logging and prints structured JSON output.
Logs can be pretty-printed by redirecting `stderr` through `bunyan` itself or `jq`, both of which are installed in
the `salty-dog` container.

To filter out error messages, then format the errors they contain:

```shell
> salty-dog | jq 'select(.level > 30) | {msg: .msg, errors: try (.errors[] | .msg), rule: try (.rule.desc)}'

[
  "rule failed",
  "containers must have complete resources specified"
]
[
  "some rules failed",
  "/resources/limits must have required property 'cpu' at item 0 of $.spec.template.spec.containers[*] for kubernetes-resources",
  null
]
```
