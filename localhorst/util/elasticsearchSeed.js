'use strict';

const { Client } = require('@elastic/elasticsearch');
const documentsToInsert = require('./recommendations.json');

const elasticsearchNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const elasticsearchIndex = process.env.ELASTICSEARCH_INDEX || 'recommendations';
const client = new Client({ node: elasticsearchNode });

/**
 * Seeds Elasticsearch: delete index, re-create index with mapping, index pre-defined documents
 * 
 * returns false if one of the steps failed. Returns true if all steps succeeded.
 */
module.exports.seedElasticsearch = () => {
  console.log('Start seed for Elasticsearch');

  const healthCheck = setInterval(() => {
    client.cluster.health({
    }).then((resp) => {

      console.log('Waiting for Elasticsearch cluster to become available...');
      console.log('Current status:', resp && resp.body ? resp.body.status : 'undefined');
      if (resp && resp.body && resp.body.status && resp.body.status === 'green') {
        console.log('Elasticsearch cluster available');
        clearInterval(healthCheck);
        seedElasticsearch();
        return;
      }
      if (err) {
        console.log(JSON.stringify(err));
      }

    }).catch((_) => {
      console.log('Failed to connect to Elasticsearch at', elasticsearchNode);
    });
  }, 1000);
};

function seedElasticsearch() {
  client.indices.delete({
    index: elasticsearchIndex,
  }).catch((err) => {
    if (err.meta.statusCode !== 404) {
      console.error('Failed to delete index', elasticsearchIndex, JSON.stringify(err));
      return false;
    }
  }).then(() => {

    console.log('Successfully deleted index');

    client.indices.create({
      index: elasticsearchIndex,
      body: {
        "settings": {
          "index": {
            "number_of_shards": 3,
            "number_of_replicas": 0
          }
        },
        "mappings": {
          "properties": {
            "category": { "type": "keyword" },
            "description": { "type": "text" },
            "imageUrl": { "type": "text" },
            "industry": { "type": "keyword" },
            "link": { "type": "text" },
            "title": { "type": "text" },
            "type": { "type": "keyword" }
          }
        }
      }
    }).catch((err) => {
      console.error('Failed to create index', elasticsearchIndex, JSON.stringify(err));
      return false;
    }).then(() => {

      console.log('Successfully created index');

      const bulkRequests = [];
      documentsToInsert.forEach(doc => {
        bulkRequests.push({
          index: {
            _index: elasticsearchIndex
          }
        });
        bulkRequests.push(doc);
      });

      client.bulk({
        index: elasticsearchIndex,
        body: bulkRequests
      }).catch((err) => {
        console.error('Failed to index documents through bulk request', JSON.stringify(err));
        return false;
      }).then(() => {
        console.log(`Successfully indexed all ${documentsToInsert.length} documents through bulk request`);
        console.log('Completed seed for Elasticsearch');
        return true;
      });

    });

  });
}
