# Workflow

This document covers the project workflow, commit and merge messages, and how to release.

- [Workflow](#Workflow)
  - [Labels](#Labels)
    - [Scopes](#Scopes)
    - [Status](#Status)
      - [Terminal Status](#Terminal-Status)
      - [Transitions](#Transitions)
    - [Types](#Types)
  - [Git](#Git)
    - [Branches](#Branches)
    - [Remotes](#Remotes)
  - [Issues](#Issues)
    - [Issue Labels](#Issue-Labels)

## Labels

Consistent labels, Scopes, and types are used in conventional commit messages, branch names, and issue labels, thus
tying them all together.

### Scopes

- build
  - `.gitlab-ci.yml`
  - `Makefile`
  - `*.mk`
- config
  - `src/config/*`
- container
  - `Dockerfile`
- docs
  - `docs/*`
- examples
  - `examples/*`
- package
  - `package.json`
- parser
  - `src/parser/*`
- rules
  - `rules/*`
- scripts
  - `scripts/*`
- visitor
  - `src/visitor/*`

### Status

- new
  - unaddressed, potentially unread
- confirmed
  - `type/bug`: reproduced
  - `type/feature`: plausible addition
- planned
  - initial scope defined
  - ready to be implemented
- progress
  - branch exists with commits
  - may have a `WIP:` merge request
- blocked
  - branch exists with commits
  - waiting for some dependency, prerequisite, etc

#### Terminal Status

- fixed
  - `type/bug`: fix has been implemented and tested
  - `type/feature`: initial scope has been implemented and tested
- declined
  - `type/bug`: could not be reproduced or will not be fixed
  - `type/feature`: will not be added

Do not close the issue until the corresponding branches have been merged and released.

#### Transitions

- `new -> confirmed`
  - `type/bug`: bug has been reproduced and verified
  - `type/feature`: feature to be planned
- `new -> declined`
  - `type/bug`: bug cannot be reproduced, fix would break existing features, cannot reasonably be implemented, etc
  - `type/feature`: feature does not fit vision, cannot reasonably be implemented, etc
- `confirmed -> planned`
  - `type/bug`: bug will be fixed
  - `type/feature`: feature has been researched and initial scope defined
- `confirmed -> declined`
  - `type/bug`: bug will not be fixed
  - `type/feature`: feature has been researched, but will not be implemented
- `planned -> progress`
  - begin writing code
- `progress -> blocked`
  - waiting for some prerequisite
- `progress -> fixed`
  - `type/bug`: fix has been implemented and tested
  - `type/feature`: initial scope has been implemented, tested, and documented
- `progress -> declined`
  - branch will not be merged
- `blocked -> declined`
  - prerequisite cannot be met

### Types

- feat
  - new features
  - additions to existing features
- fix
  - bug fixes
- lint
  - style changes
  - not strictly necessary but improve code quality
- update
  - dependency updates
  - typically handled by Renovate

## Git

### Branches

Branches should be named after the primary issue they address, with the issue type and number: `type/#-issue-title`

### Remotes

Copies of the repo exist on both Github and Gitlab. While they are mirrored, the sync is occasional; pushing to both
will immediately trigger a pipeline.

**Note:** the `origin` remote must point to Github or `standard-release` does not generate commit links in the
changelog

## Issues

### Issue Labels

Every issue must at least one label from each group: `scope/*`, `status/*`, `type/*`.
