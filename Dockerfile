FROM node:11-stretch

# copy config and rules, which change rarely
COPY docs/config-docker.yml /root/.salty-dog.yml
COPY rules /rules

# copy package and bundle, which change often
COPY package.json /salty-dog/package.json
COPY out/bundle.js /salty-dog/out/bundle.js

ENTRYPOINT [ "node", "/salty-dog/out/bundle.js" ]