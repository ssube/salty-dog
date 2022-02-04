local: build cover run-help

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
			--tag salty-dog > /dev/null || exit 1; \
	done

IMAGE_OPTIONS ?=

local-alpine:
	podman run $(IMAGE_OPTIONS) --rm -v "$(shell pwd):/salty-dog" -w /salty-dog docker.io/node:16-alpine sh -c "apk add bash build-base git && make ci"

local-stretch:
	podman run $(IMAGE_OPTIONS) --rm -v "$(shell pwd):/salty-dog" -w /salty-dog docker.io/node:16-stretch bash -c "make ci"

local-chown-leaks: ## clean up root-owned files the containers may leak
	sudo chown -R ${USER}:${USER} $(ROOT_PATH)

full: ## ultra thorough build (looong)
	$(MAKE) clean-target ci
	$(MAKE) clean-target local-alpine local-chown-leaks
	$(MAKE) clean-target local-stretch local-chown-leaks
	$(MAKE) clean-target
	@echo "Full build (CI, alpine, stretch) succeeded!"

upload-climate:
	cc-test-reporter format-coverage -t lcov -o $(TARGET_PATH)/coverage/codeclimate.json -p $(ROOT_PATH) $(TARGET_PATH)/coverage/lcov.info
	cc-test-reporter upload-coverage --debug -i $(TARGET_PATH)/coverage/codeclimate.json -r "$(shell echo "${CODECLIMATE_SECRET}" | base64 -d)"