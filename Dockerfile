FROM --platform=linux/amd64 node:16-alpine3.15 as base

WORKDIR /home/node/app

COPY package*.json ./

RUN npm update & npm cache clean --force

RUN npm install

COPY . .

FROM base as production

ENV NODE_PATH=./dist

RUN npm run build