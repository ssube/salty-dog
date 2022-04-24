# Getting Started With salty-dog

## Contents

- [Getting Started With salty-dog](#getting-started-with-salty-dog)
  - [Contents](#contents)
  - [Installing & Running](#installing--running)
  - [Loading Rules](#loading-rules)
    - [Including Rules](#including-rules)
    - [Excluding Rules](#excluding-rules)
  - [Using Check Mode](#using-check-mode)
    - [Source & Destination](#source--destination)
  - [Using Fix Mode](#using-fix-mode)
  - [Writing Custom Rules](#writing-custom-rules)
    - [Schema Checks](#schema-checks)
    - [Selecting & Filtering Elements](#selecting--filtering-elements)
  - [Examples](#examples)
    - [Validating Kubernetes Resources](#validating-kubernetes-resources)
      - [Adding Pod Defaults](#adding-pod-defaults)
    - [Validating salty-dog Rules](#validating-salty-dog-rules)
    - [Using With Gitlab CI](#using-with-gitlab-ci)

## Installing & Running

You can run salty-dog from a container, which is the recommended method, or install it as an npm package.

```shell
> podman run --rm docker.io/ssube/salty-dog --help
```

For most users, especially scripts and CI, the container is the best method. It is based on the recommended version
of NodeJS, which does not need to be installed elsewhere. You can create your own container `FROM` the salty-dog
container to add your own rules.

The npm package has a binary command that can be called within projects and exports library symbols, from programmatic
usage. The command can be invoked with `yarn salty-dog` within any project that has the package installed.

```shell
> yarn add -D salty-dog
```

Unless you want to ship salty-dog as a production library, it should typically be installed as a dev dependency.

Installing as a global package is not recommended, since it makes managing versions difficult and updates effect
multiple projects.

## Loading Rules

Each check is split up into its own rule. Rules have a name, severity level, and helpful description.

```yaml
> salty-dog --rules file.yml
# or
> salty-dog --rule-path rules/
```

### Including Rules

Rules can be loaded from files or directories, but will not be enforced unless they have been included by name, tags,
or severity level.

The recommended way to enable rules is to group them with tags, then include or exclude the tags you need.

### Excluding Rules

Rules that are specifically excluded will not be run, even if they were previously included.

## Using Check Mode

Check mode will execute rules and exit with success or failure depending on whether the sources pass the rules.

### Source & Destination

Source and destination can each be a file or standard input/output stream. If not specified, both will default to the
streams and can be used with shell pipes:

```shell
> wget https://example.com/trusted-app.yml | salty-dog | kubectl apply -f -
```

This is equivalent to:

```shell
> wget https://example.com/trusted-app.yml | salty-dog --source - --dest - | kubectl apply -f -
```

## Using Fix Mode

Fix mode will execute rules and attempt to insert defaults into the source documents so they will pass the rules.

```yaml
example input
```

With rules:

```yaml
example rules
```

Will produce:

```yaml
example output
```

## Writing Custom Rules

Custom rules can be loaded from YAML files or ES modules. Rules from file are currently limited to JSON schema rules,
which are sufficient for most purposes.

When rules need more complex logic, you can implement them with code as a module, and load those instead.

Link to rules doc, file structure.

### Schema Checks

Most rules use JSON schema and the `check` field contains the schema to be enforced. Selected elements that do
not match the schema will fail the rule, and some information shown about the field(s) that did not match.

```yaml
basic check
```

### Selecting & Filtering Elements

Rules do not always apply to the whole source document and may be partial schemas for a certain path. Elements within
that path can be further filtered, allowing exclusion by name or annotations. Only elements that are selected and pass
the filter will be checked for errors and have defaults inserted.

```yaml
basic check
```

## Examples

### Validating Kubernetes Resources

To validate a kubernetes YAML file before applying it, in the same command, run:

```shell
> salty-dog --source foo.yaml --rules kubernetes.yml --tag kubernetes | kubectl apply -f -
```

If the resources do not match the rules, `salty-dog` will exit with an error and will not print the document, so
nothing will be applied. If they are valid, or can be made valid by inserting defaults, then they will be applied.

#### Adding Pod Defaults

Using fix mode on kubernetes resources can add default resource limits or a security context to pod specs.

With input:

```yaml
pod spec without resources
```

and rules:

```yaml
[]
```

Running:

```shell
> salty-dog fix --rules
```

Will produce:

```yaml
pod spec with resources
```

### Validating salty-dog Rules

The built in schema can be used to validate rules.

```yaml
> salty-dog check --
```

### Using With Gitlab CI

Using the Docker or Kubernetes executors, define a job like:

```yaml
validate:
  image: docker.io/ssube/salty-dog
  script:
    - salty-dog --stuff
```
