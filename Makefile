# Git
export GIT_BRANCH	?= $(shell git rev-parse --abbrev-ref HEAD)
export GIT_COMMIT	?= $(shell git rev-parse HEAD)
export GIT_REMOTES	?= $(shell git remote -v | awk '{ print $1; }' | sort | uniq)
export GIT_OPTIONS	?=

# CI
export CI_COMMIT_REF_SLUG	?= $(GIT_BRANCH)
export CI_COMMIT_SHA	?= $(GIT_COMMIT)
export CI_ENVIRONMENT_SLUG	?= local
export CI_JOB_ID	?= 0
export CI_RUNNER_DESCRIPTION	?= $(shell hostname)
export CI_RUNNER_ID	?= $(shell hostname)
export CI_RUNNER_VERSION	?= 0.0.0

# Debug
export DEBUG_BIND  ?= 127.0.0.1
export DEBUG_PORT  ?= 9229

# Paths
# resolve the makefile's path and directory, from https://stackoverflow.com/a/18137056
export MAKE_PATH	?= $(abspath $(lastword $(MAKEFILE_LIST)))
export ROOT_PATH	?= $(dir $(MAKE_PATH))
export CONFIG_PATH 	?= $(ROOT_PATH)/config
export SCRIPT_PATH 	?= $(ROOT_PATH)/scripts
export SOURCE_PATH 	?= $(ROOT_PATH)/src
export TARGET_PATH	?= $(ROOT_PATH)/out
export TEST_PATH	?= $(ROOT_PATH)/test

# Node options
NODE_BIN	:= $(ROOT_PATH)/node_modules/.bin
NODE_CMD	?= $(shell env node)
NODE_DEBUG	?= --inspect-brk=$(DEBUG_BIND):$(DEBUG_PORT) --nolazy
export NODE_OPTIONS ?= --max-old-space-size=5500

# Tool options
DOCKER_IMAGE ?= ssube/salty:master
DOCS_OPTS		?= --exclude "test.+" --tsconfig "$(CONFIG_PATH)/tsconfig.json" --out "$(TARGET_PATH)/docs"
RELEASE_OPTS ?= --commit-all

# Versions
export NODE_VERSION		:= $(shell node -v)
export RUNNER_VERSION  := $(CI_RUNNER_VERSION)

all: build

clean: ## clean up the target directory
	rm -rf node_modules
	rm -rf $(TARGET_PATH)

configure: ## create the target directory and other files not in git
	mkdir -p $(TARGET_PATH)

node_modules: yarn-install

# from https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## print this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort \
		| sed 's/^.*\/\(.*\)/\1/' \
		| awk 'BEGIN {FS = ":[^:]*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

todo:
	@echo "Remaining tasks:"
	@echo ""
	@grep -i "todo" -r docs/ src/ test/ || true
	@echo ""
	@echo "Pending tests:"
	@echo ""
	@grep "[[:space:]]xit" -r test/ || true
	@echo "Casts to any:"
	@echo ""
	@grep "as any" -r src/ test/ || true
	@echo ""

# build targets
build: ## builds, bundles, and tests the application
build: bundle

bundle: node_modules
	$(NODE_BIN)/rollup --config $(CONFIG_PATH)/rollup.js

test: bundle
	$(NODE_BIN)/mocha $(TARGET_PATH)/test.js

yarn-install: ## install dependencies from package and lock file
	yarn

yarn-update: ## check yarn for outdated packages
	yarn upgrade-interactive --latest

# release targets
git-push: ## push to both gitlab and github (this assumes you have both remotes set up)
	git push $(GIT_OPTIONS) github $(GIT_BRANCH)
	git push $(GIT_OPTIONS) gitlab $(GIT_BRANCH)

# from https://gist.github.com/amitchhajer/4461043#gistcomment-2349917
git-stats: ## print git contributor line counts (approx, for fun)
	git ls-files | while read f; do git blame -w -M -C -C --line-porcelain "$$f" |\
		grep -I '^author '; done | sort -f | uniq -ic | sort -n

license-check: ## check license status
	licensed cache
	licensed status

release: ## create a release
	$(NODE_BIN)/standard-version --sign $(RELEASE_OPTS)
	GIT_OPTIONS=--tags $(MAKE) git-push

release-dry: ## test creating a release
	$(NODE_BIN)/standard-version --sign $(RELEASE_OPTS) --dry-run

upload-climate:
	cc-test-reporter format-coverage -t lcov -o $(TARGET_PATH)/coverage/codeclimate.json -p $(ROOT_PATH) $(TARGET_PATH)/coverage/lcov.info
	cc-test-reporter upload-coverage --debug -i $(TARGET_PATH)/coverage/codeclimate.json -r "$(shell echo "${CODECLIMATE_SECRET}" | base64 -d)"

upload-codecov:
	codecov --disable=gcov --file=$(TARGET_PATH)/coverage/lcov.info --token=$(shell echo "${CODECOV_SECRET}" | base64 -d)

# run targets
run-rules: ## validate the rules directory
	find $(ROOT_PATH)/rules -maxdepth 1 -name '*.yml' | while read file; \
	do \
		echo "Validating $${file}..."; \
		node out/bundle.js \
			--config-path $(ROOT_PATH)/docs \
			--config-name config-stderr.yml \
			--rules $(ROOT_PATH)/rules/salty-dog.yml \
			--source $${file} \
			--tag important > /dev/null || exit 1; \
	done

run-stream: ## validate stdin and write it to stdout, errors to stderr
	@node out/bundle.js \
		--config-path $(ROOT_PATH)/docs \
		--config-name config-stderr.yml \
		--dest - \
		--format yaml \
		--rules $(ROOT_PATH)/rules/kubernetes.yml \
		--source - \
		--tag important \
		--tag optional