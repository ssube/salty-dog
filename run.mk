ci: build test-cover test-rules test-examples

local: build test-cover run-help

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
test-rules: build-bundle
	find $(ROOT_PATH)/rules -maxdepth 1 -name '*.yml' | while read file; \
	do \
		echo "Validating $${file}..."; \
		node out/index.js \
			--config-path $(ROOT_PATH)/docs \
			--config-name config-stderr.yml \
			--rules $(ROOT_PATH)/rules/salty-dog.yml \
			--source $${file} \
			--tag salty-dog > /dev/null || exit 1; \
	done

local-alpine:
	docker run --rm -v "$(shell pwd):/salty-dog" -w /salty-dog node:11-stretch make ci

local-stretch:
	docker run --rm -v "$(shell pwd):/salty-dog" -w /salty-dog node:11-alpine sh -c "apk add build-base && make ci"
