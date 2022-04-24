# Getting Started With salty-dog

## Contents

- [Getting Started With salty-dog](#getting-started-with-salty-dog)
  - [Contents](#contents)
  - [Installing & Running](#installing--running)
    - [Formatting The Output](#formatting-the-output)
    - [Installing npm Package](#installing-npm-package)
    - [Using Within Gitlab CI](#using-within-gitlab-ci)
  - [Loading Rules](#loading-rules)
    - [Including & Excluding Rules](#including--excluding-rules)
  - [Using Check Mode](#using-check-mode)
    - [Redirecting Source & Destination](#redirecting-source--destination)
  - [Using Fix Mode](#using-fix-mode)
    - [Using Defaults With Alternatives](#using-defaults-with-alternatives)
  - [Writing Custom Rules](#writing-custom-rules)
    - [Schema Checks](#schema-checks)
    - [Selecting & Filtering Elements](#selecting--filtering-elements)
  - [Other Examples](#other-examples)
    - [Checking Grafana Dashboard Tags](#checking-grafana-dashboard-tags)
    - [Checking salty-dog Rules](#checking-salty-dog-rules)
    - [Checking Gitlab CI Jobs](#checking-gitlab-ci-jobs)

## Installing & Running

You can run `salty-dog` from a container or install it as an npm package. The container is the recommended method and
comes complete with the recommended version of node and default rules.

```shell
# to print the CLI help
> podman run --rm docker.io/ssube/salty-dog:master --help

Usage: salty-dog <mode> [options]

Commands:
...

# to list the included rules
> podman run --entrypoint sh --rm docker.io/ssube/salty-dog:master -c 'ls /salty-dog/rules'

ansible.yml
gitlab-ci.yml
grafana.yml
...
```

You can create an alias for this container and mount the current working directory:

```shell
> alias salty-dog='podman run --rm -v "${PWD}:${PWD}:ro" -w "${PWD}" docker.io/ssube/salty-dog:master'
```

_Note:_ using volumes with Podman on MacOS [requires an SSHFS mount](https://dalethestirling.github.io/Macos-volumes-with-Podman/).

Container images are available for each branch and release tag. When using the container for CI, you do not need to
install NodeJS elsewhere, and should pin your image reference to a specific tag - tools like [RenovateBot](https://github.com/renovatebot/renovate)
can automatically update those tags in a testable way. You can also create your own container
`FROM docker.io/ssube/salty-dog` in order to include your own rules or install additional modules.

### Formatting The Output

Logs from `salty-dog` are structured JSON and will be written to standard error by default, but you can configure the
output streams in order to write them to a file or standard output instead. The raw JSON is not the easiest to read
without pretty-printing, and there are a few tools that can help. The container image contains both [`bunyan`](https://github.com/trentm/node-bunyan)
and [`jq`](https://stedolan.github.io/jq/), for formatting and filtering, respectively.

```shell
> salty-dog --source test/examples/kubernetes-resources-some.yml --rules rules/kubernetes.yml --tag kubernetes --dest /tmp/valid-app.yml 2>&1 | yarn bunyan

[2022-04-24T22:16:17.236Z]  INFO: salty-dog/1365 on ceebfd6fbf03: version info
    build: {
      "job": "",
      "node": "v16.14.2",
      "runner": ""
    }
    --
    git: {
      "branch": "master",
      "commit": "a8bfb58d2ddbc12b040eaa39ee36abfa598e30e6"
    }
    --
    package: {
      "name": "salty-dog",
      "version": "0.9.1"
    }
...
[2022-04-24T22:16:02.280Z]  INFO: salty-dog/1325 on ceebfd6fbf03: no errors to report
[2022-04-24T22:16:02.280Z]  INFO: salty-dog/1325 on ceebfd6fbf03: all rules passed

# or with jq
> salty-dog --source test/examples/kubernetes-resources-some.yml --rules rules/kubernetes.yml --tag kubernetes --dest /tmp/valid-app.yml 2>&1 | jq .

{
  "name": "salty-dog",
  "hostname": "4c8d1249ca96",
  "pid": 1,
  "level": 30,
  "build": {
    "job": "",
    "node": "v16.14.2",
    "runner": ""
  },
...
  "msg": "some rules failed",
  "time": "2022-04-24T20:51:08.597Z",
  "v": 0
}
```

### Installing npm Package

The npm package installs a binary command, which can be called as `yarn salty-dog` within the installing project, and
exports most of the symbols for usage as a library.

```shell
> yarn add -D salty-dog
```

Import the main module using:

```typescript
import { main } from 'salty-dog/app';
```

Unless you want to ship `salty-dog` as a production library without bundling, it should typically be installed as a
development dependency.

Installing as a global package is not recommended, since it makes managing versions difficult and updates will effect
multiple projects.

### Using Within Gitlab CI

Using the Docker or Kubernetes executors, define a job like:

```yaml
validate:
  image: docker.io/ssube/salty-dog
  script:
    - salty-dog --stuff
```

## Loading Rules

Like many lint tools, `salty-dog` checks your documents against a set of rules. Each rule uses a different schema,
and may only check sub-paths within the document. Rules have a brief name used in the logs, a friendly
description meant for people, a severity level, and some tags. You can easily include a group of related rules by
giving them the same tag.

Rules can be loaded from YAML files or node modules, but most rules will come from a file and contain a JSON schema,
used to validate part or all of the source document. Rule files can also be loaded from a directory.

```Shell
# load a single file
> salty-dog --rules /salty-dog/rules/kubernetes.yml
# or
> salty-dog --rule-path rules/
```

### Including & Excluding Rules

Once rules have been loaded, they also need to be included before they will be run. This allows you to put rules into
a few larger files and selectively enable some topics, or exclude rules by name.

Using tags and log level makes it easy to create logical groups with more and less important rules. For example:

```yaml
name: example-rules
rules:
  - name: limit-cpu
    level: error
    tags:
      - apps
      - resources
  - name: limit-memory
    level: error
    tags:
      - apps
      - resources
  - name: limit-name
    level: info
    tags:
      - apps
      - names
```

If you want run the most important rules and check an app's resource limits while skipping the name, you can use:

```shell
> salty-dog --tag resources
# or
> salty-dog --include-tag apps --exclude-tag names
```

Either one will include the `limit-cpu` and `limit-memory` rules and exclude the `limit-name` rule. The `--tag`
option is shorthand for `--include-tag`.

Rules that are specifically excluded will not be run, even if they were previously included. That is, exclusions
take priority.

## Using Check Mode

This is the basic lint mode: each of the rules you have included will be run and the program will exit with a success
or failure code, depending on whether the source documents have passed all of the rules. Any errors will be logged,
and if the source documents are valid, they will be written out to the destination.

```shell
> salty-dog --source test/examples/kubernetes-resources-some.yml --rules rules/kubernetes.yml --tag kubernetes | bunyan

...
[2022-04-24T20:59:17.374Z]  INFO: salty-dog/175 on ceebfd6fbf03:
    rule errors
    kubernetes-resources: 1
    kubernetes-labels: 1
[2022-04-24T20:59:17.374Z] ERROR: salty-dog/175 on ceebfd6fbf03: some rules failed (count=2)
```

### Redirecting Source & Destination

Source and destination can each be a file or standard input/output stream. If not specified, both will default to the
standard streams for use with shell pipes:

```shell
> wget https://example.com/trusted-app.yml | salty-dog --rules rules/kubernetes.yml --tag kubernetes | kubectl apply -f -
```

The mode and options can also be explicitly set, so that short command is equivalent to:

```shell
> wget https://example.com/trusted-app.yml | salty-dog check --source - --dest - --rules rules/kubernetes.yml --tag kubernetes | kubectl apply -f -
```

To read the input from a file, set the `--source` path:

```shell
> salty-dog --source test/examples/kubernetes-resources-high.yml --rules rules/kubernetes.yml --tag kubernetes | kubectl apply -f -
```

To write the output to a file, set the `--destination` path:

```shell
> wget https://example.com/trusted-app.yml | salty-dog --rules rules/kubernetes.yml --tag kubernetes --dest /tmp/valid-app.yml
```

Since output and logs are written to standard output and error, respectively, shell redirection works normally. To
ignore output and format logs with `bunyan`:

```shell
> salty-dog --source test/examples/kubernetes-resources-high.yml --rules rules/kubernetes.yml --tag kubernetes 2>&1 1>/dev/null | bunyan
```

## Using Fix Mode

Fix mode will execute the same rules, but it will also attempt to insert default values into the source documents, if
the defaults would make them pass the rules. This can be used to add commonly forgotten fields, or interpolate from
environment variables, which can be especially helpful in CI.

Using the `kubernetes-container-pull-policy` rule as an example, you can add a default pull policy to containers that
are missing their own. Modifying the default rule to include a `default`:

```yaml
- name: kubernetes-container-pull-policy
  desc: all containers should have a pull policy
  level: info
  tags:
    - kubernetes
    - image
    - optional

  select: '$..containers.*'
  check:
    type: object
    required: [image, imagePullPolicy]
    properties:
      imagePullPolicy:
        type: string
        default: IfNotPresent     # this line has been added
        enum:
          - Always
          - IfNotPresent
          - Never
```

Then running with a brief pod spec that does not have the `imagePullPolicy` field:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: example
  labels: {}
spec:
  template:
    spec:
      containers:
        - name: test
          image: foo
          resources:
            limits:
              cpu: 4000m
              memory: 5Gi
            requests:
              cpu: 4000m
              memory: 5Gi
```

Should fix up the output to produce:

```yaml
> salty-dog fix --source test/examples/kubernetes-resources-pull.yml --rules rules/kubernetes-fix.yml --tag image

apiVersion: v1
kind: Pod
metadata:
  name: example
  labels: {}
spec:
  template:
    spec:
      containers:
        - name: test
          image: foo
          resources:
            limits:
              cpu: 4000m
              memory: 5Gi
            requests:
              cpu: 4000m
              memory: 5Gi
          imagePullPolicy: IfNotPresent
```

### Using Defaults With Alternatives

JSON schema supports a few alternative keywords, such as `allOf`, `anyOf`, and `oneOf`. `salty-dog` uses
[the ajv library](https://ajv.js.org/guide/modifying-data.html) to validate schemas and insert defaults. Fix mode is
specific to ajv and not part of the JSON schema spec, and so may not be portable to other tools - use with care.

Because of the order in which ajv checks alternative schemas, only one of the sub-schemas will apply its defaults. Once
the source document has matched that alternative, it will not modify the data to match any others. Keep this order in
mind while writing checks.

## Writing Custom Rules

Custom rules can be loaded from YAML files or ES modules. Rules loaded from a file are currently limited to JSON schema
rules, which support most common use-cases. When rules need more complex logic, you can implement them with in a module
and write the check in code, which allows pretty much anything.

This will cover the basics of writing custom rules. Please see [the full documentation on the rule format](./rules.md)
for more details.

### Schema Checks

Most rules use JSON schema and the `check` field contains the schema to be enforced. Selected elements that do
not match the schema will fail the rule, and some information shown about the field(s) that did not match.

Please see [the ajv documentation](https://ajv.js.org/json-schema.html) for the full JSON schema reference.

Rules that check an object should start with a `type: object` and specify its `properties`:

```yaml
check:
  type: object
  required: [image, imagePullPolicy]
  properties:
    image:
      type: string
    imagePullPolicy:
      type: string
      enum:
        - Always
        - IfNotPresent
        - Never
```

This rule checks for two required properties, `image` and `imagePullPolicy`, and defines the type for each. There are
only a few valid values for `imagePullPolicy`, which are enumerated.

This rule could be extended to check the format of the `image` and warn against using the `:latest` tag, like the
`kubernetes-image-latest` rule does, or to insert a default value for the `imagePullPolicy` if one is not provided in
the source.

### Selecting & Filtering Elements

Rules do not always apply to the whole source document and may be partial schemas for a certain path. Elements within
that path can be further filtered, allowing exclusion by name or annotations. Only elements that are selected and pass
the filter will be checked for errors and have defaults inserted.

```yaml
select: '$.compilerOptions'
filter:
  type: object
  required: [strict]
  properties:
    strict:
      type: boolean
      const: true

check:
  not:
    anyOf:
      # from https://www.typescriptlang.org/docs/handbook/compiler-options.html
      - required: [alwaysStrict]
      - required: [noImplicitAny]
      - required: [noImplicitThis]
      - required: [strictBindCallApply]
      - required: [strictNullChecks]
      - required: [strictFunctionTypes]
      - required: [strictPropertyInitialization]
```

This rule is scoped to the `$.compilerOptions` element within the source document, and will skip the `compilerOptions`
if it does not have `strict: true` set. If strict _is_ set, the individual strict options become redundant, so the
rule checks to make sure none of them exist.

## Other Examples

Much of this guide uses Kubernetes resources as examples, but there are many other JSON and YAML formats that
desperately need schema validation. `salty-dog` should support most of them, although it cannot parse files that use
custom YAML schema extensions, such as Gitlab's `!reference`.

### Checking Grafana Dashboard Tags

Since YAML is a superset of JSON, `salty-dog` can validate JSON files equally well. If you want to use fix mode and
need the output to be in JSON, you will need to use [a tool like `yq`](https://mikefarah.gitbook.io/yq/usage/convert#encode-json-simple)
to encode the output - `salty-dog` does not yet support JSON output directly.

```yaml
> salty-dog check --source ./dashboards/nodes.json --rules rules/grafana.yml --tag grafana | yq -o=json '.'
# or for older versions of yq
> salty-dog check --source ./dashboards/nodes.json --rules rules/grafana.yml --tag grafana | yq '.'
```

### Checking salty-dog Rules

You can use the rules schema to validate itself or your custom rules:

```yaml
> salty-dog check --source rules/salty-dog.yml --rules rules/salty-dog.yml --tag salty-dog

...
[2022-04-24T21:25:10.431Z]  INFO: salty-dog/278 on ceebfd6fbf03: no errors to report
[2022-04-24T21:25:10.432Z]  INFO: salty-dog/278 on ceebfd6fbf03: all rules passed
```

### Checking Gitlab CI Jobs

TODO: example
