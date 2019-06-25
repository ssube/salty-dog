FROM node:11-stretch

# copy config, which changes rarely
COPY docs/config-docker.yml /root/.salty-dog.yml

# copy package first, to invalidate other layers when version changes
COPY package.json /salty-dog/package.json

COPY rules /salty-dog/rules
COPY out/bundle.js /salty-dog/out/bundle.js

ENTRYPOINT [ "node", "/salty-dog/out/bundle.js" ]