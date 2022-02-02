include $(shell find $(ROOT_PATH) -name '*.mk' | grep -v node_modules)

# Tool options
.PHONY: all ci clean clean-deps clean-target configure help release release-dry todo
.PHONY: image image-build image-run
.PHONY: push git-stats git-push
.PHONY: node_modules out build cover deps docs lint test test-watch yarn-global yarn-update

build-bundle: node_modules
	$(NODE_BIN)/rollup --config $(CONFIG_PATH)/rollup.js
	sed -i '1s;^;#! /usr/bin/env node\n\n;' $(TARGET_PATH)/index.js
	chmod ug+x $(TARGET_PATH)/index.js

test-cover: ## run mocha unit tests with coverage reports
test-cover: test-check
	sed -i $(TARGET_PATH)/coverage/lcov.info \
		-e '/external ".*"$$/,/end_of_record/d' \
		-e '/ sync$$/,/end_of_record/d' \
		-e '/test sync/,/end_of_record/d' \
		-e '/node_modules/,/end_of_record/d' \
		-e '/bootstrap$$/,/end_of_record/d' \
		-e '/universalModuleDefinition/,/end_of_record/d'
	sed -n '/^SF/,$$p' -i $(TARGET_PATH)/coverage/lcov.info
	sed '1s;^;TN:\n;' -i $(TARGET_PATH)/coverage/lcov.info

