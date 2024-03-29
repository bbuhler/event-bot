FROM node:16-alpine

WORKDIR /app

COPY ./ ./

RUN npm ci

CMD ["node", "src/index.mjs"]
