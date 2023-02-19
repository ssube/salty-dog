# Salty Dog

`salty-dog` is a tool to validate JSON and YAML data using JSON schema rules. It can filter elements and validate
select parts of the document, supports multiple documents in the same stream or file, and can insert defaults during
validation.

[Check out the getting started guide](./docs/getting-started.md).

## Contents

- [Salty Dog](#salty-dog)
  - [Contents](#contents)
  - [Status](#status)
  - [Releases](#releases)
  - [Build](#build)
  - [Usage](#usage)
    - [Using The Container](#using-the-container)
    - [Using The Package](#using-the-package)
      - [Project Package](#project-package)
      - [Global Package](#global-package)
    - [Usage Modes](#usage-modes)
      - [Check Mode](#check-mode)
      - [Fix Mode](#fix-mode)
        - [Default Values](#default-values)
        - [Coercing Values](#coercing-values)
      - [List Mode](#list-mode)
    - [Formatting Logs](#formatting-logs)
  - [Rules](#rules)
    - [Loading Rule Sources](#loading-rule-sources)
    - [Using Rule Tags](#using-rule-tags)
    - [Validating Rules](#validating-rules)
  - [License](#license)

## Status

[![Pipeline status](https://img.shields.io/gitlab/pipeline/ssube/salty-dog.svg?gitlab_url=https%3A%2F%2Fgit.apextoaster.com&logo=gitlab)](https://git.apextoaster.com/ssube/salty-dog/commits/master)
[![MIT license](https://img.shields.io/github/license/ssube/salty-dog.svg)](https://github.com/ssube/salty-dog/blob/master/LICENSE.md)
[![Renovate badge](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![Known vulnerabilities](https://snyk.io/test/github/ssube/salty-dog/badge.svg)](https://snyk.io/test/github/ssube/salty-dog)

[![Open bug count](https://img.shields.io/github/issues-raw/ssube/salty-dog/type-bug.svg)](https://github.com/ssube/salty-dog/issues?q=is%3Aopen+is%3Aissue+label%3Atype%2Fbug)
[![Open issue count](https://img.shields.io/github/issues-raw/ssube/salty-dog.svg)](https://github.com/ssube/salty-dog/issues?q=is%3Aopen+is%3Aissue)
[![Closed issue count](https://img.shields.io/github/issues-closed-raw/ssube/salty-dog.svg)](https://github.com/ssube/salty-dog/issues?q=is%3Aissue+is%3Aclosed)

[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=ssube_salty-dog&metric=ncloc)](https://sonarcloud.io/dashboard?id=ssube_salty-dog)
[![Test coverage](https://codecov.io/gh/ssube/salty-dog/branch/master/graph/badge.svg)](https://codecov.io/gh/ssube/salty-dog)
[![Technical debt ratio](https://img.shields.io/codeclimate/tech-debt/ssube/salty-dog.svg)](https://codeclimate.com/github/ssube/salty-dog/trends/technical_debt)

[![Maintainability score](https://api.codeclimate.com/v1/badges/5d4326d6f68a2fa137cd/maintainability)](https://codeclimate.com/github/ssube/salty-dog/maintainability)
[![Quality issues](https://img.shields.io/codeclimate/issues/ssube/salty-dog.svg)](https://codeclimate.com/github/ssube/salty-dog/issues)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fssube%2Fsalty-dog.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fssube%2Fsalty-dog?ref=badge_shield)

## Releases

[![github release link](https://img.shields.io/badge/github-release-blue?logo=github)](https://github.com/ssube/salty-dog/releases)
[![github release version](https://img.shields.io/github/tag/ssube/salty-dog.svg)](https://github.com/ssube/salty-dog/releases)
[![github commits since release](https://img.shields.io/github/commits-since/ssube/salty-dog/v0.9.2.svg)](https://github.com/ssube/salty-dog/compare/v0.9.2...master)

[![npm package link](https://img.shields.io/badge/npm-package-blue?logo=npm)](https://www.npmjs.com/package/salty-dog)
[![npm release version](https://img.shields.io/npm/v/salty-dog.svg)](https://www.npmjs.com/package/salty-dog)
[![Typescript definitions](https://img.shields.io/npm/types/salty-dog.svg)](https://www.npmjs.com/package/salty-dog)

[![docker image link](https://img.shields.io/badge/docker-image-blue?logo=docker)](https://hub.docker.com/r/ssube/salty-dog)
[![docker image size](https://img.shields.io/docker/image-size/ssube/salty-dog?sort=semver)](https://microbadger.com/images/ssube/salty-dog:master)

## Build

`salty-dog` is written in Typescript and requires `make`, `node`, and `yarn` to build. It can be built locally or in
a container.

[Please see the build docs](./docs/index.md#build) for more details.

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

### Formatting Logs

`salty-dog` uses [node-bunyan](https://github.com/trentm/node-bunyan) for logging and prints structured JSON output.
Logs can be pretty-printed by redirecting `stderr` through `bunyan` itself or `jq`, both of which are installed in
the `salty-dog` container:

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

Using `jq` allows for additional filtering and formatting. For example, `jq 'select(.level > 30)'` will only print
warnings and errors (the minimum log level to print can be set in the configuration file).

To print the last line's message and error messages: `tail -1 | jq '[.msg, try (.errors[] | .msg)]'`

```shell
> cat test/examples/kubernetes-resources-high.yml | salty-dog \
    --rules rules/kubernetes.yml \
    --tag kubernetes 2> >(tail -1 | jq '[.msg, try (.errors[] | .msg)]')

[
  "all rules passed"
]

> cat test/examples/kubernetes-resources-some.yml | salty-dog \
    --rules rules/kubernetes.yml \
    --tag kubernetes 2> >(tail -1 | jq '[.msg, try (.errors[] | .msg)]')

[
  "some rules failed",
  ".resources.limits should have required property 'memory' at $.spec.template.spec.containers[*] for kubernetes-resources",
  ".metadata should have required property 'labels' at $ for kubernetes-labels"
]
```

## Rules

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

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fssube%2Fsalty-dog.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fssube%2Fsalty-dog?ref=badge_large)
