# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.4.1](https://github.com/ssube/salty-dog/compare/v0.4.0...v0.4.1) (2019-06-29)


### Build System

* include license, set binary, fix deps ([7fce611](https://github.com/ssube/salty-dog/commit/7fce611))



## [0.4.0](https://github.com/ssube/salty-dog/compare/v0.3.0...v0.4.0) (2019-06-29)


### Bug Fixes

* **build:** correct runner in version info ([e1d5144](https://github.com/ssube/salty-dog/commit/e1d5144))
* **build:** validate rules during build ([0129221](https://github.com/ssube/salty-dog/commit/0129221))
* **docker:** move rules to app dir, tweak layer order ([b6fe129](https://github.com/ssube/salty-dog/commit/b6fe129))
* **rules:** check numeric cpu limits ([aec3ea9](https://github.com/ssube/salty-dog/commit/aec3ea9))
* **rules:** ensure low CPU limits are non-0 ([97d5c7a](https://github.com/ssube/salty-dog/commit/97d5c7a))
* **rules:** remove test default ([e02cd67](https://github.com/ssube/salty-dog/commit/e02cd67))
* **rules:** validate source names ([4112a1d](https://github.com/ssube/salty-dog/commit/4112a1d))
* **scripts:** use project path for status ([cd3be38](https://github.com/ssube/salty-dog/commit/cd3be38))
* apply schema changes to data ([03b3bfa](https://github.com/ssube/salty-dog/commit/03b3bfa))
* delimit output documents ([79c7e71](https://github.com/ssube/salty-dog/commit/79c7e71))
* docker examples, container output, misc lint ([670e45a](https://github.com/ssube/salty-dog/commit/670e45a))
* list modes in help ([1f1faf8](https://github.com/ssube/salty-dog/commit/1f1faf8))
* use consistent option names in source ([c09d135](https://github.com/ssube/salty-dog/commit/c09d135))


### Build System

* add tests ([35781f8](https://github.com/ssube/salty-dog/commit/35781f8))
* omit cache from npm bundle ([c753d30](https://github.com/ssube/salty-dog/commit/c753d30))
* update image to node 11 ([e7df382](https://github.com/ssube/salty-dog/commit/e7df382))


### Features

* rule selector helper ([a630571](https://github.com/ssube/salty-dog/commit/a630571))
* **rules:** add example grafana rule ([f2579d4](https://github.com/ssube/salty-dog/commit/f2579d4))
* add cli help (fixes [#7](https://github.com/ssube/salty-dog/issues/7)) ([721f85f](https://github.com/ssube/salty-dog/commit/721f85f))
* add rules to image, doc ([e358857](https://github.com/ssube/salty-dog/commit/e358857))
* display diff when rule modifies data (fixes [#3](https://github.com/ssube/salty-dog/issues/3)) ([6f15d1c](https://github.com/ssube/salty-dog/commit/6f15d1c))
* fix mode and type coercion ([719954e](https://github.com/ssube/salty-dog/commit/719954e))
* group config & rules in help ([da42749](https://github.com/ssube/salty-dog/commit/da42749))
* list mode, fix version option ([8efbd99](https://github.com/ssube/salty-dog/commit/8efbd99))
* load definitions from rules (fixes [#2](https://github.com/ssube/salty-dog/issues/2)) ([9eb41fc](https://github.com/ssube/salty-dog/commit/9eb41fc))
* support multiple documents per source ([#11](https://github.com/ssube/salty-dog/issues/11)) ([2bd60c8](https://github.com/ssube/salty-dog/commit/2bd60c8))


### Tests

* **rule:** begin testing resolver ([caca3fc](https://github.com/ssube/salty-dog/commit/caca3fc))
* add em ([1931659](https://github.com/ssube/salty-dog/commit/1931659))


### BREAKING CHANGES

* adds a required `name` property (string) at the
top level of each `--rules` file, used as the schema name



## 0.3.0 (2019-06-16)


### Bug Fixes

* **source:** wait for output write to finish ([72bedc8](https://github.com/ssube/salty-dog/commit/72bedc8))
* refactor parser into a single class ([29f372d](https://github.com/ssube/salty-dog/commit/29f372d))
* **build:** add github status script, remove coverage jobs ([5498236](https://github.com/ssube/salty-dog/commit/5498236))
* **build:** fix artifacts ([f61b568](https://github.com/ssube/salty-dog/commit/f61b568))
* **build:** fix node target ([a1cf4cc](https://github.com/ssube/salty-dog/commit/a1cf4cc))
* **docker:** add stderr config ([8d87332](https://github.com/ssube/salty-dog/commit/8d87332))
* **docker:** only copy bundle into image ([db47b3e](https://github.com/ssube/salty-dog/commit/db47b3e))
* **rules:** make filter optional in meta-rules ([52095ed](https://github.com/ssube/salty-dog/commit/52095ed))
* limit error count ([b1ba817](https://github.com/ssube/salty-dog/commit/b1ba817))
* only print parsed args ([4a124eb](https://github.com/ssube/salty-dog/commit/4a124eb))


### Build System

* add and document target to validate rules ([1b42c26](https://github.com/ssube/salty-dog/commit/1b42c26))
* add CI ([cec3576](https://github.com/ssube/salty-dog/commit/cec3576))
* add dockerfile ([172efb9](https://github.com/ssube/salty-dog/commit/172efb9))
* fix main, do not bundle source map or vendor source dir ([da85fb3](https://github.com/ssube/salty-dog/commit/da85fb3))
* fix version info ([0f78fa4](https://github.com/ssube/salty-dog/commit/0f78fa4))
* use example stderr config when validating rules ([731c87e](https://github.com/ssube/salty-dog/commit/731c87e))


### Features

* **parser:** serialize data via parser ([ab40330](https://github.com/ssube/salty-dog/commit/ab40330))
* add modes, basic readme ([5e05c72](https://github.com/ssube/salty-dog/commit/5e05c72))
* clean rules up with a bit of a visitor pattern ([9a25fb9](https://github.com/ssube/salty-dog/commit/9a25fb9))
* **rules:** add filename as tag ([0876e72](https://github.com/ssube/salty-dog/commit/0876e72))
* make node selectors work ([282e93d](https://github.com/ssube/salty-dog/commit/282e93d))
* make rule filters optional (fixes [#4](https://github.com/ssube/salty-dog/issues/4)) ([9a7f882](https://github.com/ssube/salty-dog/commit/9a7f882))
* write to stdout or file ([a68975c](https://github.com/ssube/salty-dog/commit/a68975c))
* **config:** stream type for bunyan config ([24f91aa](https://github.com/ssube/salty-dog/commit/24f91aa))
* count errors, improve error messaging ([f50f2f1](https://github.com/ssube/salty-dog/commit/f50f2f1))
* project, build, and bundle ([8be80c3](https://github.com/ssube/salty-dog/commit/8be80c3))
* run schema, do everything but select nodes ([29aaa93](https://github.com/ssube/salty-dog/commit/29aaa93))
* working bundle, example config ([e8173d4](https://github.com/ssube/salty-dog/commit/e8173d4))
