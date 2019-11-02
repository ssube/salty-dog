# SALTY DOG

Rule-based JSON/YAML validator using JSON schemas. Capable of filtering elements to validate partial documents,
supports multiple documents per stream or file, inserting defaults, and other magic.

- [SALTY DOG](#salty-dog)
  - [Getting Started](#getting-started)
  - [Status](#status)
  - [Releases](#releases)
  - [Build](#build)
    - [Local Build](#local-build)
    - [Docker Build](#docker-build)
  - [Install](#install)
    - [Docker Install](#docker-install)
    - [Yarn Install](#yarn-install)
      - [Global](#global)
      - [Project](#project)
  - [Usage](#usage)
    - [Logs](#logs)
    - [Modes](#modes)
      - [Check Mode](#check-mode)
      - [Fix Mode](#fix-mode)
        - [Default Values](#default-values)
        - [Coercing Values](#coercing-values)
      - [List Mode](#list-mode)
    - [Rules](#rules)
      - [Enabling Rules](#enabling-rules)
      - [Validate Rules](#validate-rules)
  - [License](#license)

## Getting Started

`salty-dog` is distributed as a package and container, and can be installed or pulled:

```shell
> docker pull ssube/salty-dog:master
> yarn add -D salty-dog
> yarn global add salty-dog
```

**Note:** while the container is the preferred way of running `salty-dog`, it has a serious limitation: `docker run`
combines `stdout` and `stderr`, making it impossible to separate logs and the output document. Writing either the logs
or dest to a file works around this.

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

## Status

[![Pipeline status](https://img.shields.io/gitlab/pipeline/ssube/salty-dog.svg?gitlab_url=https%3A%2F%2Fgit.apextoaster.com&logo=gitlab)](https://git.apextoaster.com/ssube/salty-dog/commits/master)
[![Test coverage](https://codecov.io/gh/ssube/salty-dog/branch/master/graph/badge.svg)](https://codecov.io/gh/ssube/salty-dog)
[![MIT license](https://img.shields.io/github/license/ssube/salty-dog.svg)](https://github.com/ssube/salty-dog/blob/master/LICENSE.md)

[![Open bug count](https://img.shields.io/github/issues-raw/ssube/salty-dog/type-bug.svg)](https://github.com/ssube/salty-dog/issues?q=is%3Aopen+is%3Aissue+label%3Atype%2Fbug)
[![Open issue count](https://img.shields.io/github/issues-raw/ssube/salty-dog.svg)](https://github.com/ssube/salty-dog/issues?q=is%3Aopen+is%3Aissue)
[![Closed issue count](https://img.shields.io/github/issues-closed-raw/ssube/salty-dog.svg)](https://github.com/ssube/salty-dog/issues?q=is%3Aissue+is%3Aclosed)

[![Renovate badge](https://badges.renovateapi.com/github/ssube/salty-dog)](https://renovatebot.com)
[![Dependency status](https://img.shields.io/david/ssube/salty-dog.svg)](https://david-dm.org/ssube/salty-dog)
[![Dev dependency status](https://img.shields.io/david/dev/ssube/salty-dog.svg)](https://david-dm.org/ssube/salty-dog?type=dev)
[![Known vulnerabilities](https://snyk.io/test/github/ssube/salty-dog/badge.svg)](https://snyk.io/test/github/ssube/salty-dog)

[![Maintainability score](https://api.codeclimate.com/v1/badges/5d4326d6f68a2fa137cd/maintainability)](https://codeclimate.com/github/ssube/salty-dog/maintainability)
[![Technical debt ratio](https://img.shields.io/codeclimate/tech-debt/ssube/salty-dog.svg)](https://codeclimate.com/github/ssube/salty-dog/trends/technical_debt)
[![Quality issues](https://img.shields.io/codeclimate/issues/ssube/salty-dog.svg)](https://codeclimate.com/github/ssube/salty-dog/issues)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/ssube/salty-dog.svg?logo=lgtm)](https://lgtm.com/projects/g/ssube/salty-dog/context:javascript)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/ssube/salty-dog.svg)](https://lgtm.com/projects/g/ssube/salty-dog/alerts/)

## Releases

[![Github release version](https://img.shields.io/github/tag/ssube/salty-dog.svg)](https://github.com/ssube/salty-dog/releases)
[![Commits since release](https://img.shields.io/github/commits-since/ssube/salty-dog/v0.7.1.svg)](https://github.com/ssube/salty-dog/compare/v0.7.1...master)

[![npm release version](https://img.shields.io/npm/v/salty-dog.svg)](https://www.npmjs.com/package/salty-dog)
[![Docker image size](https://images.microbadger.com/badges/image/ssube/salty-dog:master.svg)](https://microbadger.com/images/ssube/salty-dog:master)

## Build

### Local Build

This project is written in Typescript and requires `make`, `node`, and `yarn` to build.

```shell
> git clone git@github.com:ssube/salty-dog.git
> cd salty-dog
> make
```

After building, run with `node out/index.js` or install run as `salty-dog`:

```shell
> cd salty-dog
> yarn global add file:$(pwd)
```

`make` targets are provided for some common arguments:

```shell
> curl https://raw.githubusercontent.com/ssube/k8s-shards/master/roles/apps/gitlab/server/templates/ingress.yml | \
    make run-stream 2> >($(yarn bin)/bunyan) > >(kubectl apply --dry-run -f -)

...
[2019-06-16T03:23:56.645Z]  INFO: salty-dog/8015 on cerberus: all rules passed
ingress.extensions/gitlab created (dry run)
```

### Docker Build

This method does not require the usual dependencies to be installed, only `docker` itself.

Build with Docker:

```shell
# Stretch
docker run --rm -v "$(pwd):/salty-dog" -w /salty-dog node:11-stretch make
docker build -t salty-dog:stretch -f Dockerfile.stretch .

# Alpine
docker run --rm -v "$(pwd):/salty-dog" -w /salty-dog node:11-alpine sh -c "apk add build-base && make"
docker build -t salty-dog:alpine -f Dockerfile.alpine .
```

## Install

### Docker Install

To run with Docker: `docker run --rm ssube/salty-dog:master`

The latest semi-stable image is `ssube/salty-dog:master`. All
[tags are listed here](https://cloud.docker.com/repository/docker/ssube/salty-dog/tags).

The Docker container is published for each branch and git tag, tagged with the git tag (or branch slug).

Rules are baked into the image in `/salty-dog/rules`. To use custom rules, mount them with
`-v $(pwd)/rules:/salty-dog/rules:ro` and load with `--rules /rules/foo.yml`.

### Yarn Install

#### Global

To install with Yarn as a global CLI tool: `yarn global add salty-dog`

To run with Node:

```shell
> export PATH="${PATH}:$(yarn global bin)"
> salty-dog --help
```

#### Project

To install with Yarn for a single project: `yarn add -D salty-dog`

To run with Node:

```shell
> export PATH="${PATH}:$(yarn bin)"
> salty-dog --help
```

## Usage

### Logs

`salty-dog` uses [node-bunyan](https://github.com/trentm/node-bunyan) for logging and prints JSON logs. These are not
the easiest to read, and can be pretty-printed by redirecting `stderr` through `bunyan` itself or `jq`:

```shell
> cat resource.yml | salty-dog --rules rules/kubernetes.yml --tag kubernetes 2> >(bunyan)

...
[2019-06-15T23:53:34.223Z]  INFO: salty-dog/19839 on cerberus: all rules passed

> cat resource.yml | salty-dog --rules rules/kubernetes.yml --tag kubernetes 2> >(jq)

...
{
  "name": "salty-dog",
  "hostname": "cerberus",
  "pid": 19839,
  "level": 30,
  "msg": "all rules passed",
  "time": "2019-06-15T23:53:34.223Z",
  "v": 0
}
```

Using `jq` allows for additional filtering, for example `>(jq 'select(.level > 30)')` will only print warnings and
errors (log level is also part of the configuration file).

### Modes

`salty-dog` can run in a few different modes: `check` mode will report errors, `fix` mode will attempt to modify the
input document, and `list` mode will print the active set of rules.

#### Check Mode

By default, `salty-dog` will validate the structure and contents of the `--source` document. If all rules pass, the
document will be printed to `--dest`.

```shell
> cat examples/kubernetes-resources-pass.yml | salty-dog \
    --rules rules/kubernetes.yml \
    --tag kubernetes

...
[2019-06-15T23:53:34.223Z]  INFO: salty-dog/19839 on cerberus: all rules passed

> cat examples/kubernetes-resources-fail.yml | salty-dog \
    --rules rules/kubernetes.yml \
    --tag kubernetes

...
[2019-06-15T23:56:04.764Z] ERROR: salty-dog/22211 on cerberus: some rules failed (errors=1)

```

The `--source` and `--dest` default to stdin and stdout, respectively, but a path may be provided:

```shell
> salty-dog \
    --rules rules/kubernetes.yml \
    --tag kubernetes \
    --source examples/kubernetes-resources-pass.yml \
    --dest /tmp/kubernetes-resource.yml

...
[2019-06-15T23:53:34.223Z]  INFO: salty-dog/19839 on cerberus: all rules passed
```

#### Fix Mode

`salty-dog` can also add default values to missing properties in `fix` mode. If a rule does not immediately pass
with the `--source` document, but defaults are provided in the schema, the defaults will be inserted before printing to
`--dest`.

```shell
> salty-dog fix \
    --source examples/kubernetes-resources-some.yml \
    --rules rules/kubernetes.yml \
    --tag kubernetes
```

##### Default Values

Properties that appear in the schema with a `default` provided will be added to each element as it is checked. Rules
apply in order, as do their defaults.

##### Coercing Values

Properties that appear in the document with a different `type` than they have in the schema may be coerced, if the
value is compatible with the schema type. [The full matrix of valid type coercions](https://ajv.js.org/coercion.html)
is documented by Ajv.

#### List Mode

`salty-dog` can list the active set of rules, to help debug tags and inclusion. Both `--source` and `--dest` are
ignored in `list` mode.

```shell
> salty-dog list \
    --rules rules/kubernetes.yml \
    --tag kubernetes

...
[2019-06-30T18:39:11.930Z]  INFO: salty-dog/26330 on cerberus: listing active rules
    rules: [
      {
        "desc": "resource limits are too low",
        "level": "debug",
        "name": "kubernetes-resources-minimum-cpu",

...
    ]
```

### Rules

Rules combine a jsonpath expression and JSON schema to select and validate the document.

The rule's `select` expression is used to select nodes that should be validated, which are `filter`ed, then `check`ed.

The structure of rule files and the rules within them [are documented here](docs/rules.md).

#### Enabling Rules

All rules are disabled by default and must be enabled by name, level, or tag.

To enable a single rule by name, `--include-name foo-rule`.

To enable a group of rules by level, `--include-level warn`.

To enable a group of rules by tag, `--include-tag foo`.

#### Validate Rules

To validate the rules in the `rules/` directory using the meta-rules:

```shell
> make test-rules

...
{"name":"salty-dog","hostname":"cerberus","pid":29403,"level":30,"msg":"all rules passed","time":"2019-06-16T00:56:55.132Z","v":0}
```

## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fssube%2Fsalty-dog.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fssube%2Fsalty-dog?ref=badge_large)
