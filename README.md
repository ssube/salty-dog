# SALTY DOG

Rule-based YAML validator using JSON schemas. Capable of filtering elements to validate partial documents, supports
multiple documents per stream or file, inserting defaults, and other magic.

- [SALTY DOG](#SALTY-DOG)
  - [Usage](#Usage)
    - [Docker](#Docker)
    - [Check Mode](#Check-Mode)
    - [Fix Mode](#Fix-Mode)
      - [Default Values](#Default-Values)
      - [Coercing Values](#Coercing-Values)
  - [Rules](#Rules)
    - [Enabling Rules](#Enabling-Rules)
    - [Validate Rules](#Validate-Rules)
  - [Build](#Build)

## Usage

To run with Docker (**recommended**): `docker run --rm ssube/salty-dog:master`

To download, validate, and apply a Kubernetes resource:

```shell
> curl https://raw.githubusercontent.com/ssube/k8s-shards/master/roles/apps/gitlab/server/templates/ingress.yml |\
    salty-dog \
    --rules rules/kubernetes.yml \
    --source - \
    --tag important | kubectl apply --dry-run -f -

...
{"name":"salty-dog","hostname":"cerberus","pid":7860,"level":30,"msg":"all rules passed","time":"2019-06-16T02:04:37.797Z","v":0}
ingress.extensions/gitlab created (dry run)
```

### Docker

The latest semi-stable image is `ssube/salty-dog:master`. All
[tags are listed here](https://cloud.docker.com/repository/docker/ssube/salty-dog/tags).

The Docker container is published for each branch and git tag, tagged with the version slug (`.` replaced with `-`,
mostly).

Rules are baked into the image in `/salty-dog/rules`. To use custom rules, mount them with
`-v $(pwd)/rules:/salty-dog/rules:ro` and load with `--rules /rules/foo.yml`.

### Check Mode

By default, `salty-dog` will validate the structure and contents of the `--source` document. If all rules pass, the
document will be printed to `--dest`.

```shell
> cat examples/kubernetes-resources-pass.yml | salty-dog \
    --rules rules/kubernetes.yml \
    --tag important

...
[2019-06-15T23:53:34.223Z]  INFO: salty-dog/19839 on cerberus: all rules passed

> cat examples/kubernetes-resources-fail.yml | salty-dog \
    --rules rules/kubernetes.yml \
    --tag important

...
[2019-06-15T23:56:04.764Z] ERROR: salty-dog/22211 on cerberus: some rules failed (errors=1)

```

The `--source` and `--dest` default to stdin and stdout, respectively, but a path may be provided:

```shell
> salty-dog \
    --rules rules/kubernetes.yml \
    --tag important \
    --source examples/kubernetes-resources-pass.yml \
    --dest /tmp/kubernetes-resource.yml

...
[2019-06-15T23:53:34.223Z]  INFO: salty-dog/19839 on cerberus: all rules passed
```

### Fix Mode

`salty-dog` can also add default values to missing properties with `--mode fix`. If a rule does not immediately pass
with the `--source` document, but defaults are provided in the schema, the defaults will be inserted before printing to
`--dest`.

#### Default Values

Properties that appear in the schema with a `default` provided will be added to each element as it is checked. Rules
apply in order, as do their defaults.

#### Coercing Values

Properties that appear in the document with a different `type` than they have in the schema may be coerced, if the
value is compatible with the schema type. [The full matrix of valid type coercions](https://ajv.js.org/coercion.html)
is documented by Ajv.

## Rules

Rules combine a jsonpath expression and JSON schema to select and validate the document.

The rule's `select` expression is used to select nodes that should be validated, which are `filter`ed, then `check`ed.

The structure of rule files and the rules within them [are documented here](docs/rules.md).

### Enabling Rules

All rules are disabled by default and must be enabled by name or tag.

To enable a single rule by name, `--include-name foo-rule`.

To enable a group of rules by tag, `--include-tag foo`.

### Validate Rules

To validate the rules in the `rules/` directory using the meta-rules:

```shell
> make run-rules

...
{"name":"salty-dog","hostname":"cerberus","pid":29403,"level":30,"msg":"all rules passed","time":"2019-06-16T00:56:55.132Z","v":0}
```

## Build

This project is written in Typescript and requires `node` and `yarn` to build.

```shell
> git clone git@github.com:ssube/salty-dog.git
> cd salty-dog
> make
```

After building, run with: `node out/bundle.js`

`make` targets are provided for some common arguments:

```shell
> curl https://raw.githubusercontent.com/ssube/k8s-shards/master/roles/apps/gitlab/server/templates/ingress.yml | make run-stream 2> >(./node_modules/.bin/bunyan) > >(kubectl apply --dry-run -f -)

...
[2019-06-16T03:23:56.645Z]  INFO: salty-dog/8015 on cerberus: all rules passed
ingress.extensions/gitlab created (dry run)
```
