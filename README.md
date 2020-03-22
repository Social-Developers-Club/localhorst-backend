# Localhorst Backend

## Development

1. Start a local Elasticsearch instance:
   ```bash
   docker run -p 9200:9200 -e "discovery.type=single-node" --name elasticsearch docker.elastic.co/elasticsearch/elasticsearch:7.6.1
   ```
   You can access Elasticsearch at [http://localhost:9200](http://localhost:9200).

2. Optional: start a Kibana instance:
   ```bash
   docker run --link elasticsearch:elasticsearch -p 5601:5601 kibana:7.6.1
   ```
   You can access Kibana at [http://localhost:5601](http://localhost:5601).

3. Start the NodeJS application:
   ```bash
   cd localhorst/
   npm install
   DEBUG=localhorst:* npm start
   ```

## Build

```bash
docker build -t supportforlocalhorst/localhorst-backend .
docker push supportforlocalhorst/localhorst-backend
```
