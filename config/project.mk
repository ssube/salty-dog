.PHONY: bundle-shebang cover-fixup

bundle-shebang: bundle
	sed -i '1s;^;#! /usr/bin/env node\n\n;' $(TARGET_PATH)/bundle/index.cjs
	chmod ug+x $(TARGET_PATH)/bundle/index.cjs

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

