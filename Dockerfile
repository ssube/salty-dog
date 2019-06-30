FROM node:11-stretch

# copy config, which changes rarely
COPY docs/config-docker.yml /root/.salty-dog.yml

# copy package first, to invalidate other layers when version changes
COPY package.json /salty-dog/package.json
COPY out/vendor.js /salty-dog/out/vendor.js
COPY out/main.js /salty-dog/out/main.js

COPY rules /salty-dog/rules

ENTRYPOINT [ "node", "/salty-dog/out/main.js" ]