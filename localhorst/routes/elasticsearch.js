'use strict';

const express = require('express');
const router = express.Router();

const { Client } = require('@elastic/elasticsearch');
const elasticsearchNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const elasticsearchIndex = process.env.ELASTICSEARCH_INDEX || 'recommendations';

router.get('/', (req, res) => {
    const client = new Client({ node: elasticsearchNode });

    const categories = [];
    const industries = [];
    const type = req.query.type;
    const text = req.query.text;

    if (Array.isArray(req.query.category)) {
        categories.push(...req.query.category);
    } else if (req.query.category !== undefined) {
        categories.push(req.query.category);
    }

    if (Array.isArray(req.query.industry)) {
        industries.push(...req.query.industry);
    } else if (req.query.industry !== undefined) {
        industries.push(req.query.industry);
    }

    let searchQuery;

    // match all documents when no query params given; else build complex query
    if ((categories.length === 0) && (industries.length === 0) && !type && !text) {
        searchQuery = {
            "query": {
                "match_all": {}
            }
        };
    } else {

        searchQuery = {
            "query": {
                "bool": {
                    "must": []
                }
            }
        };

        if (categories.length > 0) {
            searchQuery.query.bool.must.push({
                "terms": {
                    "category": categories
                }
            });
        }

        if (industries.length > 0) {
            searchQuery.query.bool.must.push({
                "terms": {
                    "industry": industries
                }
            });
        }

        if (type) {
            searchQuery.query.bool.must.push({
                "term": {
                    "type": {
                        "value": type
                    }
                }
            });
        }

        // Match given text in fields 'title' or 'description'
        if (text) {
            searchQuery.query.bool.must.push({
                "bool": {
                    "should": [
                        {
                            "match": {
                                "title": text
                            }
                        },
                        {
                            "match": {
                                "description": text
                            }
                        }
                    ]
                }
            });
        }

    }

    // TODO: in case that we'll ever have more than 100 documents in Elasticsearch,
    // then we should use the scrolling API / pagination.
    searchQuery.size = 100;

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
            res.status(503).send('Failed to query database');
        });


});

module.exports = router;
