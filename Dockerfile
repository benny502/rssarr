FROM node:lts-alpine AS builder
WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
COPY public ./public
COPY server ./server
COPY src ./src
COPY bundled ./bundled
RUN yarn --frozen-lockfile --network-timeout 500000
RUN yarn build:web && yarn build:bundle && rm ./bundled/.gitignore

FROM alpine:latest 
RUN apk --no-cache add ca-certificates nodejs
WORKDIR /usr/src/app
COPY --from=builder /app/bundled ./
COPY --from=builder /app/build ./build
# COPY app ./
EXPOSE 12306
VOLUME /usr/src/app/data
CMD ["/usr/bin/node", "index.js"]
