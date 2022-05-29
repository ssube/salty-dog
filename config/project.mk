.PHONY: cover-fixup

IMAGE_OPTIONS ?=

ci-full: ci test-examples test-rules

cover-fixup: ## run mocha unit tests with coverage reports
cover-fixup: cover
	sed -i $(TARGET_PATH)/coverage/lcov.info \
		-e '/external ".*"$$/,/end_of_record/d' \
		-e '/ sync$$/,/end_of_record/d' \
		-e '/test sync/,/end_of_record/d' \
		-e '/node_modules/,/end_of_record/d' \
		-e '/bootstrap$$/,/end_of_record/d' \
		-e '/universalModuleDefinition/,/end_of_record/d'
	sed -n '/^SF/,$$p' -i $(TARGET_PATH)/coverage/lcov.info
	sed '1s;^;TN:\n;' -i $(TARGET_PATH)/coverage/lcov.info

full: ## ultra thorough build (looong)
	$(MAKE) clean-target ci
	$(MAKE) clean-target local-alpine local-chown-leaks
	$(MAKE) clean-target local-stretch local-chown-leaks
	$(MAKE) clean-target
	@echo "Full build (CI, alpine, stretch) succeeded!"

local: build cover run-help

local-alpine:
	podman run $(IMAGE_OPTIONS) --rm -v "$(shell pwd):/salty-dog" -w /salty-dog docker.io/node:16-alpine sh -c "apk add bash build-base git && make ci"

local-stretch:
	podman run $(IMAGE_OPTIONS) --rm -v "$(shell pwd):/salty-dog" -w /salty-dog docker.io/node:16-stretch bash -c "make ci"

local-chown-leaks: ## clean up root-owned files the containers may leak
	sudo chown -R ${USER}:${USER} $(ROOT_PATH)

# run targets
run-help: ## print the help
	@node out/index.js --help

run-stream: ## validate stdin and write it to stdout, errors to stderr
	@node out/index.js \
		--config-path $(ROOT_PATH)/docs \
		--config-name config-stderr.yml \
		--dest - \
		--format yaml \
		--rules $(ROOT_PATH)/rules/tsconfig.yml \
		--source - \
		--tag tsconfig

test-examples: ## run medium (feature) tests
	$(SCRIPT_PATH)/test-examples.sh

test-rules: ## validate the rules directory
test-rules: build
	find $(ROOT_PATH)/rules -maxdepth 1 -name '*.yml' | while read file; \
	do \
		echo "Validating $${file}..."; \
		node out/src/index.js \
			--config-path $(ROOT_PATH)/docs \
			--config-name config-stderr.yml \
			--rules $(ROOT_PATH)/rules/salty-dog.yml \
			--source $${file} \
			--tag salty-dog 2>&1 >/dev/null | yarn bunyan || exit 1; \
	done

upload-climate:
	cc-test-reporter format-coverage -t lcov -o $(TARGET_PATH)/coverage/codeclimate.json -p $(ROOT_PATH) $(TARGET_PATH)/coverage/lcov.info
	cc-test-reporter upload-coverage --debug -i $(TARGET_PATH)/coverage/codeclimate.json -r "$(shell echo "${CODECLIMATE_SECRET}" | base64 -d)"
