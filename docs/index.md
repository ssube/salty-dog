# Salty Dog

`salty-dog` is a tool to validate JSON and YAML data using JSON schema rules.

- [Salty Dog](#salty-dog)
  - [Usage](#usage)
    - [Container](#container)
    - [Package](#package)
      - [Project](#project)
      - [Global](#global)
  - [Rules](#rules)
    - [Sources](#sources)
    - [Tags](#tags)
  - [Output](#output)
    - [Data](#data)
    - [Logs](#logs)

## Usage

`salty-dog` is distributed as a package or container.

While the container is the preferred way of running `salty-dog`, it has a serious limitation: `docker run` combines
`stdout` and `stderr`, making it impossible to separate logs and the output document. Writing either the logs or dest
to a file works around this.

### Container

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

### Package

`salty-dog` can be installed from npm and used as a binary or programmatically.

#### Project

To install `salty-dog` for the current project:

```shell
> yarn add -D salty-dog
> $(yarn bin)/salty-dog --help
```

#### Global

It is also possible to install `salty-dog` globally, rather than within a project. However, this is
not recommended.

```shell
> yarn global add salty-dog
> export PATH="${PATH}:$(yarn global bin)"
> salty-dog --help
```

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

### Sources

Rules can be loaded from YAML files, directories thereof, and Node modules.

### Tags

Not all of the loaded rules need to be used. They can be selected by tags.

## Output

`salty-dog` outputs two streams: valid input data and error logs.

### Data

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

### Logs

Log messages are written in JSON using the bunyan library, and can be pretty-printed with `bunyan` or `jq` (both of
which are installed in the `salty-dog` container).

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
