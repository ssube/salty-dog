export NODE_VERSION := $(shell node -v 2>/dev/null || echo "none")
export PACKAGE_NAME := $(shell jq -r '.name' package.json 2>/dev/null || echo "unknown")
export PACKAGE_VERSION := $(shell jq -r '.version' package.json 2>/dev/null || echo "unknown")
export RUNNER_VERSION := $(CI_RUNNER_VERSION)

# Debug
export DEBUG_BIND ?= 127.0.0.1
export DEBUG_PORT ?= 9229

# Node options
NODE_CMD ?= $(shell env node)
NODE_DEBUG ?= --inspect-brk=$(DEBUG_BIND):$(DEBUG_PORT) --nolazy

.PHONY: build bundle ci clean-deps cover deps docs lint test yarn-global yarn-upgrade

# directory targets
node_modules: deps

out: build

# phony targets
build: ## build the app
build: node_modules
	yarn tsc
	cat $(TARGET_PATH)/src/version.js | envsubst > $(TARGET_PATH)/src/version-out.js
	mv $(TARGET_PATH)/src/version-out.js $(TARGET_PATH)/src/version.js

bundle: build
	node config/esbuild.mjs

bundle-shebang: bundle
	sed -i '1s;^;#! /usr/bin/env node\n\n;' $(TARGET_PATH)/bundle/index.cjs
	chmod ug+x $(TARGET_PATH)/bundle/index.cjs

ci: clean-target lint build bundle bundle-shebang cover docs

clean-deps: ## clean up the node_modules directory
	rm -rf node_modules/

COVER_ARGS := --all \
	--check-coverage \
	--exclude ".eslintrc.js" \
	--exclude "bundle/**" \
	--exclude "config/**" \
	--exclude "docs/**" \
	--exclude "examples/**" \
	--exclude "out/bundle/**" \
	--exclude "out/coverage/**" \
	--exclude "vendor/**" \
	--reporter=text-summary \
	--reporter=lcov \
	--report-dir=out/coverage

cover: ## run tests with coverage
cover: node_modules out
	yarn c8 $(COVER_ARGS) yarn mocha $(MOCHA_ARGS) "out/**/Test*.js"

deps:
	yarn

docs:
	yarn api-extractor run -c config/api-extractor.json
	yarn api-documenter markdown -i out/api -o docs/api

lint: ## run eslint
lint: node_modules
	yarn eslint src/ --ext .ts,.tsx

MOCHA_ARGS := --async-only \
	--check-leaks \
	--forbid-only \
	--require source-map-support/register \
	--require out/test/setup.js \
	--recursive \
	--sort

test: ## run tests
test: node_modules out
	yarn mocha $(MOCHA_ARGS) "out/**/Test*.js"

yarn-global: ## install bundle as a global tool
	yarn global add file:$(ROOT_PATH)

yarn-upgrade: ## check yarn for potential upgrades
	yarn upgrade-interactive --latest
