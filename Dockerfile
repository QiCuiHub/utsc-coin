FROM node:latest

WORKDIR /app
ADD package.json /app
ADD core /app/core
ADD blockchain /app/blockchain
ADD wallet /app/wallet

RUN npm install
ENTRYPOINT npm run dev
