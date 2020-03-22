'use strict';

const express = require('express');
const router = express.Router();

const { Client } = require('@elastic/elasticsearch');
const elasticsearchNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const elasticsearchIndex = process.env.ELASTICSEARCH_INDEX || 'recommendations';

router.get('/get-all-recommendations', (req, res, next) => {
    const client = new Client({ node: elasticsearchNode });
    client.search({
        index: elasticsearchIndex,
        body: {
            query: {
                match_all: {}
            }
        }
    }).then((searchResponse) => {
        const hits = searchResponse.body.hits.hits.map(hit => hit['_source']);
        res.setHeader('Content-Type', 'application/json');
        res.json(hits);
    }).catch((err) => {
        res.status(503).send('Failed to query Elasticsearch');
    });
});

module.exports = router;
