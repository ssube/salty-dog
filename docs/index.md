# Salty Dog

Rule-based YAML validator using JSON schemas.

## Rules

Rules can be loaded from YAML files or Node modules and [are documented here](./rules.md).

## Usage

`salty-dog` is distributed as a package or container.

While the container is the preferred way of running `salty-dog`, it has a serious limitation: `docker run` combines
`stdout` and `stderr`, making it impossible to separate logs and the output document. Writing either the logs or dest
to a file works around this.

### Docker

The `ssube/salty-dog` image can be run once or interactively:

```shell
> docker pull ssube/salty-dog:master
> docker run --rm ssube/salty-dog:master --help
```

#### Interactive

```shell
> docker run --rm --entrypoint bash ssube/salty-dog:master
```

### Node

The `salty-dog` package can be installed locally (for use in a single project) or globally (as a binary).

#### Global

```shell
> yarn global add salty-dog
> export PATH="${PATH}:$(yarn global bin)"
> salty-dog --help
```

#### Local

```shell
> yarn add -D salty-dog
> $(yarn bin)/salty-dog --help
```
