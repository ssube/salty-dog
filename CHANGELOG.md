# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.9.2](https://github.com/ssube/salty-dog/compare/v0.9.1...v0.9.2) (2023-02-19)


### Features

* **build:** include compiled src in image ([38e349a](https://github.com/ssube/salty-dog/commit/38e349a628ebfc1ff967233569183f32ddcda9c0))
* re-export most significant symbols from app ([8196d6c](https://github.com/ssube/salty-dog/commit/8196d6c10aebd5c7f2528c4bfef438cc1185edd6))
* **app:** add CLI option for reporter ([912eb82](https://github.com/ssube/salty-dog/commit/912eb82accf8033c871218ae84834252fe0f63ad))
* **config:** add destination as an alias for d/dest ([3ac66cf](https://github.com/ssube/salty-dog/commit/3ac66cf1e8720183e1918bba92921f408c1733f0))
* **docs:** outline of guide ([28cb25e](https://github.com/ssube/salty-dog/commit/28cb25e179591f4599ce9ac1e7939bd4cbdae734))
* **reporter:** add markdown delimiter row to table report ([8ce71b9](https://github.com/ssube/salty-dog/commit/8ce71b9bfba226b0c5294a1184cce386c8e09240))
* **reporter:** format total errors per rule in table reporter ([9fbc6b0](https://github.com/ssube/salty-dog/commit/9fbc6b06c41be2c66a862eabb70274cb8636a018))
* **reporter:** include changes in table report ([2941a1c](https://github.com/ssube/salty-dog/commit/2941a1cd9d9df45bd143c65b226f1a4b419862ab))
* **scripts:** add a way to skip conventional formatting ([4aa23fe](https://github.com/ssube/salty-dog/commit/4aa23fe75f85dae1658dfdad57b248d3dc0b1c9e))
* **scripts:** add commit message template ([9ae54f3](https://github.com/ssube/salty-dog/commit/9ae54f3a18aa9b1067fdbad94beede564a7f42f0))
* **scripts:** add project-specific aliases ([64f5429](https://github.com/ssube/salty-dog/commit/64f54294dccd044946c4df9e6724b4e05ed8b6e9))
* **scripts:** add scope alias and allow functions ([ddb7fbc](https://github.com/ssube/salty-dog/commit/ddb7fbcc2c87f0ff2c963e0f85913fcdb7d8d714))
* **scripts:** clean up debug logging, handle filenames better ([a5d9a96](https://github.com/ssube/salty-dog/commit/a5d9a9670e488b042ca9e61d1c57d01737578242))
* **scripts:** correctly handle path scopes ([e8f3103](https://github.com/ssube/salty-dog/commit/e8f31036f6ed3e28d645984f26d19479d82e84cb))
* **scripts:** lint commit script ([118ec94](https://github.com/ssube/salty-dog/commit/118ec94b836859faab24492d3ebb409a37390d4d))
* **scripts:** remove trim from scope alias ([6023dcd](https://github.com/ssube/salty-dog/commit/6023dcde99b1e326af3abc4478681edbc0c297ea))
* **scripts:** support stdin/out instead of message file ([cb6c047](https://github.com/ssube/salty-dog/commit/cb6c04708be5e23906dc1b3f40b67c228bb5ba94))
* **scripts:** use assoc arrays for alias rather than splitting repeatedly ([387bef7](https://github.com/ssube/salty-dog/commit/387bef7ff0f0bae2d6f465839482c2e64a4d7ab6))
* **source:** formalize source data with Document and Element ([1fa3865](https://github.com/ssube/salty-dog/commit/1fa386581e0a210041679c6cd8ced74b481891d2))
* **test:** add example and rule to insert image pull policy ([047673c](https://github.com/ssube/salty-dog/commit/047673c6afbd4f2a6a1c1e368f6906d7915a98d9))


### Bug Fixes

* **build:** correct mapped line numbers in test stack traces ([57c667c](https://github.com/ssube/salty-dog/commit/57c667cc991f543fc3323770d520ca5cec6e728f))
* **build:** run rule/example tests during CI ([81aac07](https://github.com/ssube/salty-dog/commit/81aac07fd5783856e9337d5f208c29ffec6b0857))
* **config:** make args parser type safe ([0427a09](https://github.com/ssube/salty-dog/commit/0427a092bec59c72743e8172002073bfc7b6a9e2))
* **deps:** replace usage of deprecated array helper with new name ([84afd78](https://github.com/ssube/salty-dog/commit/84afd78b6983f1946f6dff6420c46f842da8829a))
* **docs:** clean up readme badges ([3bd740e](https://github.com/ssube/salty-dog/commit/3bd740eea59ff941d1aaf1695ef2737bdc4f14ca))
* **docs:** flesh out getting started guide ([fa86f1d](https://github.com/ssube/salty-dog/commit/fa86f1d73eb0b1900b87736f78013df10cffe525))
* **docs:** remove test table from docs ([b2122d5](https://github.com/ssube/salty-dog/commit/b2122d57808ebf7f29bb1b46025eae95e63d50e4))
* **lint:** quote test output ([0719045](https://github.com/ssube/salty-dog/commit/0719045782fa600553b4d89f5bb9cf840b04cd35))
* **reporter:** add margin before and after each table field ([f7a4b63](https://github.com/ssube/salty-dog/commit/f7a4b63d5c6a20f422bfa4f87c50d20550a9cf41))
* **reporter:** avoid repeat copies in table report ([fe4d13d](https://github.com/ssube/salty-dog/commit/fe4d13d51cbae0ca7ec5538a014ac8c428be459d))
* **rules:** expect required image field to be a string in pull policy rule ([6da2eb5](https://github.com/ssube/salty-dog/commit/6da2eb54d2291131844036d5cb1bfffed9fd9c9a))
* **scripts:** correct parsing of type-only messages ([27164c6](https://github.com/ssube/salty-dog/commit/27164c6b4ecb764b3e1c0c790b49f3031f5d69d3))
* **scripts:** use commit type from message file when present ([4cadb4c](https://github.com/ssube/salty-dog/commit/4cadb4ccda374b64d802d2e715bb0b13906554d3))
* **test:** correctly check lines, remove empty alternative ([322de06](https://github.com/ssube/salty-dog/commit/322de068f8a79fbcc4c7731cd46dab9659e8decf))
* **test:** cover new reporters ([09f83ee](https://github.com/ssube/salty-dog/commit/09f83ee5ab52c3c7d63c0629af0e678192dd3b41))

### [0.9.1](https://github.com/ssube/salty-dog/compare/v0.9.0...v0.9.1) (2022-02-25)


### Bug Fixes

* look up schema from entrypoint rather than cwd (fixes [#1023](https://github.com/ssube/salty-dog/issues/1023)) ([f40a52a](https://github.com/ssube/salty-dog/commit/f40a52a3832f03d2bdf276c5deaca61f8840788a))
* use built in schema when executing container command ([5768224](https://github.com/ssube/salty-dog/commit/5768224b72339971f81a9d1010f5146265c8dc81))

## [0.9.0](https://github.com/ssube/salty-dog/compare/v0.9.0-0...v0.9.0) (2022-02-12)


### Features

* **build:** better error handling for image build ([c9fd4f1](https://github.com/ssube/salty-dog/commit/c9fd4f13bdd6d2b54acdeafd37aeddbf02058afc))
* **deps:** upgrade Typescript to 4.5, improve config and rule module error handling ([bdf88f0](https://github.com/ssube/salty-dog/commit/bdf88f092e688bce9dc5845fc5149d184e483850))


### Bug Fixes

* **build:** add shebang to bundle before imaging ([ee41f60](https://github.com/ssube/salty-dog/commit/ee41f60d8c588fa0d1a8a10749f9082d9af7348f))
* **build:** bundle during CI run ([80b7f69](https://github.com/ssube/salty-dog/commit/80b7f698ef732bc538229f198dee56e5590fd210))
* **build:** move project-specific targets into their own file ([0fd8ea9](https://github.com/ssube/salty-dog/commit/0fd8ea9d5c3b16fa843a3e513875c3cc6ebd444b))
* **build:** prevent unintentional exit from image script ([189b3e2](https://github.com/ssube/salty-dog/commit/189b3e202ec65f8a6b9b66a4ead82d3d21769464))
* **build:** silence package metadata warnings when jq is not installed ([86aeac5](https://github.com/ssube/salty-dog/commit/86aeac58519f626cb9ca9b7611fb204323bf1b47))

## [0.9.0-0](https://github.com/ssube/salty-dog/compare/v0.8.3...v0.9.0-0) (2022-02-06)


### ⚠ BREAKING CHANGES

* this is not breaking for users, but for library users,
some bundling or a runtime supporting ES modules is now required.
* updates Ajv from v6 to v8, with the breaking
changes included there (https://ajv.js.org/v6-to-v8-migration.html).
This removes support for JSON-Schema draft-04 and adds new
drafts and keywords.
* this changes how directories are listed, by replacing
the recursive-readdir module with node's readdir method, and a custom
implementation that is compatible with the changes to Node 16's fs
implementation for testing.

### Features

* **build:** bundle with esbuild ([4188452](https://github.com/ssube/salty-dog/commit/41884525dab702f47202d7036fee74a01497954d))
* convert to ES modules, C8 for coverage ([cea8c8a](https://github.com/ssube/salty-dog/commit/cea8c8abffad162766cc0f5568d718950054439d))
* list files using node's fs module instead of recursive-readdir ([e7e42ee](https://github.com/ssube/salty-dog/commit/e7e42eee896c3eda0eb8c207fbbef285f181dc6d))
* update Ajv, schema rule usage thereof ([41b5a39](https://github.com/ssube/salty-dog/commit/41b5a395ee91b9622d5b744ad35cd04f6e9348c9))


### Bug Fixes

* **build:** build file include paths ([07cd12b](https://github.com/ssube/salty-dog/commit/07cd12bed50c289e9a65d69f9f8a645107168033))
* **build:** interpolate bundle with version metadata ([2893437](https://github.com/ssube/salty-dog/commit/2893437718b7006d8cdada7a868e4668366d3e99))
* **build:** make example test script compatible with container build targets ([bbadd3e](https://github.com/ssube/salty-dog/commit/bbadd3e82cb4b56af5f68d5ff0c376fb433c9687))
* **build:** paths for API docs/types, podman and lockfile for image targets ([557d285](https://github.com/ssube/salty-dog/commit/557d2851a81c63dd55af1f425eaaa41aff143477))
* **build:** reduce output from example tests ([a6b05d9](https://github.com/ssube/salty-dog/commit/a6b05d9c764fcc4d844718ed674ebdb49e23eb63))
* **build:** restore codeclimate target ([b6a515d](https://github.com/ssube/salty-dog/commit/b6a515d08e19057eb247a53b59783e4027d6591e))
* **build:** set docker TLS options ([dd9023e](https://github.com/ssube/salty-dog/commit/dd9023ec8b16c46f96bf1226a7288c71fd3261cc))
* **build:** use node 16 for container build targets ([2970837](https://github.com/ssube/salty-dog/commit/29708372153abece305c9c44d97b49851cce6330))
* **build:** use yarn to run release script, remove rollup ref from shebang target ([a55d09e](https://github.com/ssube/salty-dog/commit/a55d09e7a2a6d15649bfc0eca2d9efd8aa281349))
* **docs:** expand on usage, add section on log formatting ([3a1275c](https://github.com/ssube/salty-dog/commit/3a1275cf8c0ce7cc36e03ad7fd6f0a40c69e176f))
* **docs:** make readme and GH pages more similar ([ea562fa](https://github.com/ssube/salty-dog/commit/ea562fa143c712c3ecde40360af01c7212019232))
* **docs:** update broken badges ([58d37a8](https://github.com/ssube/salty-dog/commit/58d37a83166ef5c3d1c2a752621ecb49f79bf23f))
* **image:** only copy bundle files into image ([65410ce](https://github.com/ssube/salty-dog/commit/65410ceaa34dda7af479b82dd1fd0c823f8f7600))
* **lint:** indentation in version metadata ([8d8d3da](https://github.com/ssube/salty-dog/commit/8d8d3da8418f1caf4823d2d6a352d07b9a40ed2a))
* **rule:** improve error messaging for empty schema files ([9c433fd](https://github.com/ssube/salty-dog/commit/9c433fd02b96c1f83fc8038ea1016c0d731d6329))
* **tests:** correct paths to schema, test config ([ed26185](https://github.com/ssube/salty-dog/commit/ed26185e31e12cb5fc06362071ad95824fd02318))
* more ES imports, some corresponding import changes, reset mock FS after every test ([052ca73](https://github.com/ssube/salty-dog/commit/052ca736d2df34370d81ce2d24dba23e556f032e))
* usage of __dirname, lint rules and corresponding fixes ([3b7e48a](https://github.com/ssube/salty-dog/commit/3b7e48a49437efdc9a21b869241b403b95b963e1))

### [0.8.3](https://github.com/ssube/salty-dog/compare/v0.8.2...v0.8.3) (2021-07-10)


### Features

* **build:** configure auto merge bot ([f93ccb2](https://github.com/ssube/salty-dog/commit/f93ccb283507bb57fa119a8d512a678663e7ed63))


### Bug Fixes

* **build:** build images from cached version ([c615a00](https://github.com/ssube/salty-dog/commit/c615a00efa318e43059266efe6b22123faaffdd0))
* **build:** correct base image name ([792a355](https://github.com/ssube/salty-dog/commit/792a355a862ae692246fe807d2b785871976b339))
* group test updates, automerge dev deps ([26ee49a](https://github.com/ssube/salty-dog/commit/26ee49a5e20b4582a26ecbb4ecff35d4aa48b36d))
* reduce renovate noise ([91cea7f](https://github.com/ssube/salty-dog/commit/91cea7f36ef62a237a2622379bd1e108c2f109dd))
* reduce renovate noise for eslint ([d9eb200](https://github.com/ssube/salty-dog/commit/d9eb20008c946a3511c435d83b400fe43190b734))
* remove redundant rollup plugins ([6baa04f](https://github.com/ssube/salty-dog/commit/6baa04f9458a040de49e4781b3aa4868857f9130))
* **build:** disable warnings for shadowing of private global types ([c3ad926](https://github.com/ssube/salty-dog/commit/c3ad9267fa6f51f0b777a81d6e0676134bb14f40))
* **build:** externalize source map modules to fix requires ([bd75fd0](https://github.com/ssube/salty-dog/commit/bd75fd01adb9cae5d5108e5e8d55ac8f47f79cdb))
* **build:** pull dind from nexus ([7926d17](https://github.com/ssube/salty-dog/commit/7926d1740a107bfdbfd58a2772f113623595fc10))
* **build:** pull images from nexus ([caface1](https://github.com/ssube/salty-dog/commit/caface1e93b3174c98ea4809883152159f1539e6))
* **build:** update eslint for typescript-eslint 4 rules ([75819b7](https://github.com/ssube/salty-dog/commit/75819b76cc23d3b625b7c28814408c5ca1a94202))
* **config:** bundle yargs module again ([bd56752](https://github.com/ssube/salty-dog/commit/bd56752cebf0d5724e49f8f529faf978dbc57fa8))
* **image:** remove yargs from bundle, add to image ([14a51ee](https://github.com/ssube/salty-dog/commit/14a51eefaa216026c8e970cb64800a69b1111c3c))
* require commonjs version of yargs to resolve named exports ([234b277](https://github.com/ssube/salty-dog/commit/234b27738eae9aa08a06baa9313e64a15331b268))
* **config:** update lint to naming-convention rule ([6646c32](https://github.com/ssube/salty-dog/commit/6646c32704fc7a98736d5dcc6e0e67ef84e4f864))
* **test:** cover includes in config ([5cd1ab6](https://github.com/ssube/salty-dog/commit/5cd1ab6fb5716f645f88f548b941f3047da4390e))
* register new lodash exports ([37b8e32](https://github.com/ssube/salty-dog/commit/37b8e326aa519d93a70a716a50422356237eb1f0))

### [0.8.2](https://github.com/ssube/salty-dog/compare/v0.8.1...v0.8.2) (2020-04-17)


### Bug Fixes

* **test:** leaking config load ([2fc7d76](https://github.com/ssube/salty-dog/commit/2fc7d7683c22ca81a46b12254a431b89b62cec18))

### [0.8.1](https://github.com/ssube/salty-dog/compare/v0.8.0...v0.8.1) (2020-03-11)


### Features

* **container:** install bunyan and jq for log parsing ([#263](https://github.com/ssube/salty-dog/issues/263)) ([dd37262](https://github.com/ssube/salty-dog/commit/dd372629510feea8da61d9928c443f7ccee08f38))
* make mutate an option within fix mode (fixes [#144](https://github.com/ssube/salty-dog/issues/144)) ([705af89](https://github.com/ssube/salty-dog/commit/705af893a3271c6e72b01015847c00f89608af2b))
* short aliases for common options (fixes [#145](https://github.com/ssube/salty-dog/issues/145)) ([f367291](https://github.com/ssube/salty-dog/commit/f367291540dfcdda14f95e08affd10a2f5260996))
* validate config while loading ([c1ff388](https://github.com/ssube/salty-dog/commit/c1ff388aff9c941aca264a14f91aa55bbfe03d47))
* validate rules while loading ([dbfe042](https://github.com/ssube/salty-dog/commit/dbfe0429fab64325edb097234342e893feed2a55))
* **build:** add sonar job ([1fa6bad](https://github.com/ssube/salty-dog/commit/1fa6bada4723fdb22734045fcb5acf1729a9883a))
* **rules:** add npm package ([42ddb3e](https://github.com/ssube/salty-dog/commit/42ddb3ecd764d6a64be9a925ee9ed41d24bab590))
* **rules:** add rules to validate json schemas ([0b5fe3d](https://github.com/ssube/salty-dog/commit/0b5fe3d5e5305d81db737e8c9e10acc210d42517))
* **rules/kubernetes:** add rule to prevent latest tag, rule to ensure pull policy is set ([8254848](https://github.com/ssube/salty-dog/commit/8254848ef84d106d354ca1270e45fa39347e479d))
* **rules/travis:** add language rule ([9a50046](https://github.com/ssube/salty-dog/commit/9a500461c1e501b1905c53ed81f6039dbab3906d))


### Bug Fixes

* **build:** handle unplaced chunks ([7187cac](https://github.com/ssube/salty-dog/commit/7187cac40c2e5bc73363d5fb609bc7a9b2b67465))
* **config:** accept S regex flag, anchor slashes ([2812254](https://github.com/ssube/salty-dog/commit/2812254ba55075632f526d1a7f683f57d660415d))
* **docs:** put contents in section, use yarn-global target ([84d2ba4](https://github.com/ssube/salty-dog/commit/84d2ba470ba49ca10319f1589186027bab99d6ec))
* **lint:** selectively allow null types ([899dac2](https://github.com/ssube/salty-dog/commit/899dac262ec10948a25d182dd58d96518380c2b1))
* **rules:** remove min length from rule desc ([8c1c45d](https://github.com/ssube/salty-dog/commit/8c1c45dfeba76141cdf7300acaa184b483126cf4))
* **rules/gitlab:** handle include ([b84e7b8](https://github.com/ssube/salty-dog/commit/b84e7b80c605d62e9e93f0c9868286674bb7436d))
* **tests:** cover read config, rule module helpers ([c0eb3e0](https://github.com/ssube/salty-dog/commit/c0eb3e0bfc684847edea44dd69af082b94f62673))
* **tests:** cover rule failures through main ([c053da9](https://github.com/ssube/salty-dog/commit/c053da90514da555fa4e7f3d3f274c7ca667311d))
* **tests:** cover rule loading from file/path ([85b81ea](https://github.com/ssube/salty-dog/commit/85b81ea86c399a6494438817e32d728aff816118))
* **tests:** cover rule module error handling, exclude by level ([b3fa9dd](https://github.com/ssube/salty-dog/commit/b3fa9dd9be9898edb686c63770b4ed614bdebaac))
* **tests:** cover source read and write ([838f87b](https://github.com/ssube/salty-dog/commit/838f87baf521eba6cad2585c9f44f5b0ec0397f5))
* **tests:** mock config when listing rules ([c9b6c9f](https://github.com/ssube/salty-dog/commit/c9b6c9fe4e7b8501f957dd4a4f837d200d911ea1))
* log schema names correctly, do not log unmatched files ([02ccffd](https://github.com/ssube/salty-dog/commit/02ccffda6b66f35eb57398eb94c2bfa1d35fb932))
* manually pass argv to yargs ([11b3bd0](https://github.com/ssube/salty-dog/commit/11b3bd0d09ac5570639495eb3c2fb7218038560a))
* update log level to use enum ([13d42e8](https://github.com/ssube/salty-dog/commit/13d42e8b6fe16a8a848b229aaa6aae24cb74aac4))

## [0.8.0](https://github.com/ssube/salty-dog/compare/v0.7.1...v0.8.0) (2019-11-10)


### ⚠ BREAKING CHANGES

* **visitor:** rule errors must be grouped and returned in the rule

### Bug Fixes

* **build:** add shebang to index ([c746f62](https://github.com/ssube/salty-dog/commit/c746f62))
* **build:** clean up after container builds ([c9a42f3](https://github.com/ssube/salty-dog/commit/c9a42f3))
* **build:** update rollup config from template ([80d3cb8](https://github.com/ssube/salty-dog/commit/80d3cb8))
* **docs:** add rule options to readme ([3cbf443](https://github.com/ssube/salty-dog/commit/3cbf443))
* **rule:** allow leading directories in rule path glob ([00c7b89](https://github.com/ssube/salty-dog/commit/00c7b89))
* export exit statuses ([e0dca3c](https://github.com/ssube/salty-dog/commit/e0dca3c))
* **build:** add full build target for local and containers ([79b4c9a](https://github.com/ssube/salty-dog/commit/79b4c9a))
* **build:** adopt rollup-template makefile, CI scripts ([a5bb2f4](https://github.com/ssube/salty-dog/commit/a5bb2f4))
* **build:** exclude partial typedefs and test bundle from package ([da0e080](https://github.com/ssube/salty-dog/commit/da0e080))
* **build:** include template jobs ([f9d3a44](https://github.com/ssube/salty-dog/commit/f9d3a44))
* **build:** replace template jobs with extends ([3ae9412](https://github.com/ssube/salty-dog/commit/3ae9412))
* **docs:** cover loading rules from module and path ([8ab6bb2](https://github.com/ssube/salty-dog/commit/8ab6bb2))
* **rules:** filter gitlab jobs better ([988b942](https://github.com/ssube/salty-dog/commit/988b942))
* **rules:** group rule errors to trigger correct failure ([#114](https://github.com/ssube/salty-dog/issues/114)) ([0c30036](https://github.com/ssube/salty-dog/commit/0c30036))
* **rules:** remove redundant rule field from result ([b5d4698](https://github.com/ssube/salty-dog/commit/b5d4698))
* **rules:** validate rule check/filter against full JSON schema metaschema ([afeba99](https://github.com/ssube/salty-dog/commit/afeba99))
* **tests:** add gitlab CI test snippet, move test snippets into test dir ([247e1ab](https://github.com/ssube/salty-dog/commit/247e1ab))
* **tests:** cover visit rules pass and errors ([44b1a60](https://github.com/ssube/salty-dog/commit/44b1a60))
* extract rule interface ([ebe15fb](https://github.com/ssube/salty-dog/commit/ebe15fb))
* **config:** group yargs to fix result TS interface ([5fefe0c](https://github.com/ssube/salty-dog/commit/5fefe0c))
* **docs:** note pretty-printing logs ([a3b8341](https://github.com/ssube/salty-dog/commit/a3b8341))
* **rules/tsconfig:** flatten target-lib using data refs ([b3c66dc](https://github.com/ssube/salty-dog/commit/b3c66dc))
* **tests:** use count flag to check example errors ([d2156a5](https://github.com/ssube/salty-dog/commit/d2156a5))
* **visitor:** handle missing errors gracefully ([9725685](https://github.com/ssube/salty-dog/commit/9725685))
* **visitor:** include rule name and selector in error messages ([fcd4740](https://github.com/ssube/salty-dog/commit/fcd4740))
* **visitor:** log added schemas correctly ([29e9462](https://github.com/ssube/salty-dog/commit/29e9462))
* **visitor:** remove error method from context ([842006c](https://github.com/ssube/salty-dog/commit/842006c)), closes [#114](https://github.com/ssube/salty-dog/issues/114)
* build a rule selector from args, log it in list mode ([59e7c13](https://github.com/ssube/salty-dog/commit/59e7c13))
* include active/loaded rule count in list mode output ([05f3f2f](https://github.com/ssube/salty-dog/commit/05f3f2f))
* move completion into main, remove weird exit from arg parsing ([a2a0fb4](https://github.com/ssube/salty-dog/commit/a2a0fb4))


### Features

* adopt rollup template index (fixes [#118](https://github.com/ssube/salty-dog/issues/118)) ([53e00c5](https://github.com/ssube/salty-dog/commit/53e00c5))
* recursively load rules (fixes [#135](https://github.com/ssube/salty-dog/issues/135)) ([6f4b324](https://github.com/ssube/salty-dog/commit/6f4b324))
* **build:** add build-in-image targets to make ([f805945](https://github.com/ssube/salty-dog/commit/f805945))
* **build:** replace tslint with eslint ([7052096](https://github.com/ssube/salty-dog/commit/7052096))
* **rules:** add item index to rule error (fixes [#116](https://github.com/ssube/salty-dog/issues/116)) ([f0b5109](https://github.com/ssube/salty-dog/commit/f0b5109))
* **rules:** load JSON rule files when using --rule-path ([5229ada](https://github.com/ssube/salty-dog/commit/5229ada))
* **visitor:** move jsonpath pick to context for modules to use ([b99431b](https://github.com/ssube/salty-dog/commit/b99431b))
* enable data refs ([2b0dc92](https://github.com/ssube/salty-dog/commit/2b0dc92))
* load rules from directories ([#8](https://github.com/ssube/salty-dog/issues/8)) and modules ([#6](https://github.com/ssube/salty-dog/issues/6)) ([9fbf7cc](https://github.com/ssube/salty-dog/commit/9fbf7cc))
* split rule and helpers, test rule ([b3dc864](https://github.com/ssube/salty-dog/commit/b3dc864))

### [0.7.1](https://github.com/ssube/salty-dog/compare/v0.7.0...v0.7.1) (2019-11-01)


### Bug Fixes

* **build:** publish npm packages to npmjs.org ([b9819b8](https://github.com/ssube/salty-dog/commit/b9819b8))
* **docs:** update readme tags ([e7d1f9f](https://github.com/ssube/salty-dog/commit/e7d1f9f))
* **rule:** log and apply mutation when rule has > 0 diffs ([63b6e48](https://github.com/ssube/salty-dog/commit/63b6e48))

## [0.7.0](https://github.com/ssube/salty-dog/compare/v0.6.1...v0.7.0) (2019-11-01)


### Bug Fixes

* **build:** add tslint back to rollup ([6aa1cb5](https://github.com/ssube/salty-dog/commit/6aa1cb5))
* **build:** pin docker/dind images ([070a623](https://github.com/ssube/salty-dog/commit/070a623))
* **build:** replace app with package in version data ([c76781b](https://github.com/ssube/salty-dog/commit/c76781b))
* **build:** set a default image arch, do not suffix those tags ([37b1aae](https://github.com/ssube/salty-dog/commit/37b1aae))
* **build:** switch to relative imports ([0ab6de7](https://github.com/ssube/salty-dog/commit/0ab6de7))
* **build:** switch to relative imports ([45a53a9](https://github.com/ssube/salty-dog/commit/45a53a9))
* **build:** tag images with architecture ([d2c50a1](https://github.com/ssube/salty-dog/commit/d2c50a1))
* **build:** use npm mirror ([c5aeac0](https://github.com/ssube/salty-dog/commit/c5aeac0))
* **config:** pass include errors as nested cause ([6ab7d9c](https://github.com/ssube/salty-dog/commit/6ab7d9c))
* **config/include:** handle more errors in include ([4a05fcd](https://github.com/ssube/salty-dog/commit/4a05fcd))
* **docs:** disambiguate build/install headers ([47fe866](https://github.com/ssube/salty-dog/commit/47fe866))
* **docs:** fix license section ([100f9ce](https://github.com/ssube/salty-dog/commit/100f9ce))
* **rule:** print failure message when errors are present ([5160eaa](https://github.com/ssube/salty-dog/commit/5160eaa))
* **scripts:** make example tests more shell compatible ([#106](https://github.com/ssube/salty-dog/issues/106)) ([1304cf5](https://github.com/ssube/salty-dog/commit/1304cf5))
* **test:** set mutate option for test contexts ([72920b2](https://github.com/ssube/salty-dog/commit/72920b2))
* **tests:** add async helpers for tests, wrap async tests, make chai external ([0eb9d51](https://github.com/ssube/salty-dog/commit/0eb9d51))
* **tests:** always print actual exit status of test scenarios ([77c1d0c](https://github.com/ssube/salty-dog/commit/77c1d0c))
* **tests:** begin testing friendly errors, other errors (exceptions) ([a13a909](https://github.com/ssube/salty-dog/commit/a13a909))
* **tests:** begin testing rules ([013b1d7](https://github.com/ssube/salty-dog/commit/013b1d7))
* star import ([93f4917](https://github.com/ssube/salty-dog/commit/93f4917))


### Features

* **build:** add alpine image jobs ([017dfd7](https://github.com/ssube/salty-dog/commit/017dfd7))
* include data path in error messages ([67a61f6](https://github.com/ssube/salty-dog/commit/67a61f6))
* **docs:** add fossa badge ([7aaaf29](https://github.com/ssube/salty-dog/commit/7aaaf29))
* **test:** add nyc coverage ([e627a51](https://github.com/ssube/salty-dog/commit/e627a51))
* **test:** add source map support ([489ca33](https://github.com/ssube/salty-dog/commit/489ca33))
* **visitor:** improve error messages ([#20](https://github.com/ssube/salty-dog/issues/20)) ([c9c1a58](https://github.com/ssube/salty-dog/commit/c9c1a58))
* make fix mode mutations and defaults independent ([30ab437](https://github.com/ssube/salty-dog/commit/30ab437))

### [0.6.1](https://github.com/ssube/salty-dog/compare/v0.6.0...v0.6.1) (2019-07-04)


### Bug Fixes

* use global yargs to fix bundle ([23b791f](https://github.com/ssube/salty-dog/commit/23b791f))



## [0.6.0](https://github.com/ssube/salty-dog/compare/v0.5.0...v0.6.0) (2019-07-04)


### Bug Fixes

* **docs:** remove container and package scopes ([fff8155](https://github.com/ssube/salty-dog/commit/fff8155))
* print completion or rules before attempting to load source ([8b9d84e](https://github.com/ssube/salty-dog/commit/8b9d84e))
* wrap yargs and exit after completion ([8b8d669](https://github.com/ssube/salty-dog/commit/8b8d669))
* **build:** test rules during other tests ([3e3cc7d](https://github.com/ssube/salty-dog/commit/3e3cc7d))
* **container:** use git tags as-is ([a72597d](https://github.com/ssube/salty-dog/commit/a72597d))
* **test:** use ref config for example tests ([25d967b](https://github.com/ssube/salty-dog/commit/25d967b))


### Build System

* split jobs to fix image tagging ([c438a8b](https://github.com/ssube/salty-dog/commit/c438a8b))


### Features

* add command completion ([39c0e4b](https://github.com/ssube/salty-dog/commit/39c0e4b))
* **test:** add pragmas to examples, add example tests to build ([b7d0b43](https://github.com/ssube/salty-dog/commit/b7d0b43))
* **test:** rules and tags pragmas ([cce8671](https://github.com/ssube/salty-dog/commit/cce8671))
* **test:** start adding pragma-based tests to examples ([0c7d442](https://github.com/ssube/salty-dog/commit/0c7d442))
* add default rule selector ([15933ba](https://github.com/ssube/salty-dog/commit/15933ba))
* **rules/grafana:** add rule to ensure single env, add staging alert rule ([229a0c8](https://github.com/ssube/salty-dog/commit/229a0c8))


### BREAKING CHANGES

* the `--mode` option has been replaced by a positional
command, but the options and defaults are unchanged.



## [0.5.0](///compare/v0.4.1...v0.5.0) (2019-07-01)


### Bug Fixes

* make -v an alias for --version ([5f5b993](https://github.com/ssube/salty-dog/commit/5f5b993))
* **build:** actually fix mdl config ([675b200](https://github.com/ssube/salty-dog/commit/675b200))
* **build:** add rpt2 cache to cache rather than artifacts ([0996390](https://github.com/ssube/salty-dog/commit/0996390))
* **build:** artifact all output ([9eacea6](https://github.com/ssube/salty-dog/commit/9eacea6))
* **build:** attempt to fix mdl config ([24ebc9e](https://github.com/ssube/salty-dog/commit/24ebc9e))
* **build:** clean up output directory between builds ([30ea7d6](https://github.com/ssube/salty-dog/commit/30ea7d6))
* **build:** move sinon to vendor chunk ([d02b223](https://github.com/ssube/salty-dog/commit/d02b223))
* **build:** run generic build target ([c41d9d0](https://github.com/ssube/salty-dog/commit/c41d9d0))
* **build:** split index into its own chunk ([8351fff](https://github.com/ssube/salty-dog/commit/8351fff))
* **container:** set up as cli tool within container ([ef2a9c9](https://github.com/ssube/salty-dog/commit/ef2a9c9))
* **rules/tsconfig:** correctly enforce lib/target for esnext ([62d58fe](https://github.com/ssube/salty-dog/commit/62d58fe))


### Build System

* image build and global install targets ([8368271](https://github.com/ssube/salty-dog/commit/8368271))
* remove license from chunks ([ac86e69](https://github.com/ssube/salty-dog/commit/ac86e69))
* remove redundant tsconfig options ([37c0dbb](https://github.com/ssube/salty-dog/commit/37c0dbb))
* **package:** set module entry point to main bundle ([7e2d20e](https://github.com/ssube/salty-dog/commit/7e2d20e))
* split vendor chunk ([96d15bb](https://github.com/ssube/salty-dog/commit/96d15bb))


### Features

* **rules:** add tsconfig rules ([27843c6](https://github.com/ssube/salty-dog/commit/27843c6))
* **rules:** kubernetes rule to require labels ([aa350cc](https://github.com/ssube/salty-dog/commit/aa350cc))
* **rules/tsconfig:** check for suppressed errors ([d11f3d6](https://github.com/ssube/salty-dog/commit/d11f3d6))
* **test:** begin testing visitor ([31d1977](https://github.com/ssube/salty-dog/commit/31d1977))
* configure renovate for semantic commits ([fbcc143](https://github.com/ssube/salty-dog/commit/fbcc143))
* extend renovate presets ([2d0b7ad](https://github.com/ssube/salty-dog/commit/2d0b7ad))



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
