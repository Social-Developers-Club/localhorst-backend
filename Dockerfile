FROM node:13-slim as builder

WORKDIR /app
COPY localhorst/ .
RUN npm install && npm test

FROM node:13-slim

ENV PORT=8080 \
    NODE_ENV=production \
    ELASTICSEARCH_NODE="http://localhorst-elasticsearch:9200" \
    ELASTICSEARCH_INDEX="recommendations"

WORKDIR /app

COPY --from=builder app/ .

EXPOSE 8080

ENTRYPOINT [ "npm", "start" ]