FROM node:11-stretch

COPY package.json /salty-dog/package.json
COPY out/ /salty-dog/out

WORKDIR /salty-dog

RUN npm link

ENV PATH "${PATH}:/usr/local/lib/node_modules"

ENTRYPOINT [ "node", "/salty-dog/out/bundle.js" ]