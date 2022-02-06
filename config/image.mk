.PHONY: image image-build image-run

image: ## build the docker image
	docker build $(DOCKER_ARGS) -f Dockerfile -t $(DOCKER_IMAGE) .

image-build: ## build a docker image
	$(SCRIPT_PATH)/docker-build.sh --push

image-run: ## run the development image
image-run:
	podman run --rm -it \
		-e SSH_AUTH_SOCK=${SSH_AUTH_SOCK} \
		-v /run/user/$(shell id -u)/:/run/user/$(shell id -u)/:ro \
		-v $(shell dirname ${SSH_AUTH_SOCK}):$(shell dirname ${SSH_AUTH_SOCK}):rw \
		-v ${HOME}/.gnupg/:/root/.gnupg/:rw \
		-v $(ROOT_PATH):$(ROOT_PATH):rw \
		-w $(ROOT_PATH) \
		docker.artifacts.apextoaster.com/apextoaster/node:16.6 bash
