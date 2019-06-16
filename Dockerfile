FROM node:11-stretch

COPY docs/config-stderr.yml /root/.salty-dog.yml
COPY package.json /salty-dog/package.json
COPY out/bundle.js /salty-dog/out/bundle.js

WORKDIR /salty-dog

ENV PATH "${PATH}:/usr/local/lib/node_modules"

ENTRYPOINT [ "node", "/salty-dog/out/bundle.js" ]