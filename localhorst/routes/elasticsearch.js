'use strict';

const express = require('express');
const router = express.Router();

const { Client } = require('@elastic/elasticsearch');
const elasticsearchNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const elasticsearchIndex = process.env.ELASTICSEARCH_INDEX || 'recommendations';

router.get('/', (req, res) => {
    const client = new Client({ node: elasticsearchNode });

    const category = req.query.category;
    const industry = req.query.industry;
    const type = req.query.type;
    const text = req.query.text;

    let searchQuery;

    // match all documents when no query params given; else build complex query
    if (!category && !industry && !type && !text) {
        searchQuery = {
            "query": {
                "match_all": {}
            }
        }
    } else {

        searchQuery = {
            "query": {
                "bool": {
                    "must": []
                }
            }
        };

        if (category) {
            searchQuery.query.bool.must.push({
                "term": {
                    "category": {
                        "value": category
                    }
                }
            })
        }

        if (industry) {
            searchQuery.query.bool.must.push({
                "term": {
                    "industry": {
                        "value": industry
                    }
                }
            })
        }

        if (type) {
            searchQuery.query.bool.must.push({
                "term": {
                    "type": {
                        "value": type
                    }
                }
            })
        }

        if (text) {
            searchQuery.query.bool.must.push({
                "match": {
                    "description": text
                }
            })
        }

    }

    client.search({ index: elasticsearchIndex, body: searchQuery })
        .then(searchResults => {
            const hits = searchResults.body.hits.hits.map(hit => {
                return {
                    id: hit['_id'],
                    score: hit['_score'],
                    doc: hit['_source']
                }
            });
            res.setHeader('Content-Type', 'application/json');
            res.json(hits);
        }).catch((err) => {
            console.error('Failed to query Elasticsearch', JSON.stringify(err));
            res.status(503).send('Failed to query Elasticsearch');
        });


});

module.exports = router;
