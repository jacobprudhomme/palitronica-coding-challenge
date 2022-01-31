# Builder
FROM node:16.13-alpine AS builder

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

RUN npm run build

# Final Image
FROM nginx:1.21-alpine

COPY --from=builder /public /usr/share/nginx/html
