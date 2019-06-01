FROM node:latest

WORKDIR /app
ADD package.json /app
ADD core /app/core

RUN npm install
ENTRYPOINT npm test
