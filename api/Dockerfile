FROM node:16.13-alpine AS builder

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start"]
