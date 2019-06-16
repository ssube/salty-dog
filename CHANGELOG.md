# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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



## 0.2.0 (2019-06-16)


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
