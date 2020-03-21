# Debug

1. Start a local Elasticsearch instance:
   ```bash
   docker run -p 9200:9200 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.6.1
   ```

2. Start Express server:
   ```bash
   cd localhorst/
   npm install
   DEBUG=localhorst:* npm start
   ```