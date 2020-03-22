# Localhorst Backend

## About

This repository contains the source code for the backend application of _Support for Localho(r)st_.

_Support for Localho(r)st_ was initiated during the hackathon [#WirVsVirus](https://www.bundesregierung.de/breg-de/themen/coronavirus/wir-vs-virus-1731968) that was initiated by the German government and took place between March 20 and March 22, 2020. You can read more about our idea in our [Devpost project](https://devpost.com/software/1_016_a_lokale_unternehmen_support_your_localho-r-st).

You can access a live demo of our project at [http://support-for-localhorst.philenius.de](http://support-for-localhorst.philenius.de/). The backend is deployed at [http://sfl-backend.philenius.de](http://sfl-backend.philenius.de).

This backend application provides access to our data that is stored in [Elasticsearch](https://www.elastic.co/elasticsearch/). We use Elasticsearch's full-text search and result scoring to display filtered results in our frontend. The backend implementation is based on [NodeJS](https://nodejs.org/en/) and uses the [official Node.js client for Elasticsearch](https://github.com/elastic/elasticsearch-js). The resulting app is dockerized so that it can run everywhere respectively on every cloud. The latest build in form of a Docker image is hosted on [Docker Hub](https://hub.docker.com/repository/docker/supportforlocalhorst/localhorst-backend).

![](architecture.png)

## Development

1. Start a local Elasticsearch instance:
   ```bash
   docker run -p 9200:9200 -e "discovery.type=single-node" --name elasticsearch --rm docker.elastic.co/elasticsearch/elasticsearch:7.6.1
   ```
   You can access Elasticsearch at [http://localhost:9200](http://localhost:9200).

2. Optional: start a Kibana instance:
   ```bash
   docker run --link elasticsearch:elasticsearch -p 5601:5601 --rm kibana:7.6.1
   ```
   You can access Kibana at [http://localhost:5601](http://localhost:5601). Kibana provides a graphical UI for Elasticsearch.

3. Start the NodeJS backend application:
   ```bash
   cd localhorst/
   npm install
   ELASTICSEARCH_NODE="http://localhost:9200" DEBUG=localhorst:* npm start
   ```

4. You can access the API of the backend application using curl or your browser:

   ```bash
   # get all recommendations
   curl "http://localhost:3000/recommendations"
   
   # get filtered recommendations
   curl "http://localhost:3000/recommendations?type=info&industry=retail&text=kredit&category=financial"
   ```

:warning: Due to crappy design, this backend application seeds Elasticsearch with a 30s delay after starting the application. Until this seed, the API won't return any results.

## Build

```bash
docker build -t supportforlocalhorst/localhorst-backend .
docker push supportforlocalhorst/localhorst-backend
```

## Local Deployment

* You can run the backend using Docker:

  ```bash
  docker run \
    -p 9200:9200 \
    -e "discovery.type=single-node" \
    --network host \
    --name elasticsearch \
    --rm docker.elastic.co/elasticsearch/elasticsearch:7.6.1
  
  docker run \
    -p 8080:8080 \
    -e ELASTICSEARCH_NODE="http://localhost:9200" \
    --network host \
    --rm supportforlocalhorst/localhorst-backend
  ```

  The backend application can now be access at [http://localhost:8080](http://localhost:8080).

* Alternatively, you can our Docker Compose file for starting the whole application stack (including frontend, backend, and database):

  ```bash
  docker-compose up
  ```

  The frontend application can be access at [http://localhost:8081](http://localhost:8081). The backend runs on [http://localhost:8080](http://localhost:8080).

:warning: Due to crappy design, this backend application seeds Elasticsearch 30 seconds after starting the application. Until this seed, the API won't return any results.

## Related Repositories

- [localhorst-frontend](https://github.com/Social-Developers-Club/localhorst-frontend)
- [localhorst-chatbot-backend](https://github.com/Social-Developers-Club/localhorst-chatbot-backend)
