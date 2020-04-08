'use strict';

const express = require('express');
const router = express.Router();

const { Client } = require('@elastic/elasticsearch');
const elasticsearchNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const elasticsearchIndex = process.env.ELASTICSEARCH_INDEX || 'recommendations';

router.get('/', (req, res) => {
    const client = new Client({ node: elasticsearchNode });

    const categories = parseQueryParamToArray(req.query.category);
    const industries = parseQueryParamToArray(req.query.industry);
    const types = parseQueryParamToArray(req.query.type);
    const text = req.query.text;

    let searchQuery;

    // match all documents when no query params given; else build complex query
    if ((categories.length === 0) && (industries.length === 0) && (types.length === 0) && !text) {
        searchQuery = {
            "query": {
                "match_all": {}
            }
        };
        console.log('match all query');
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

        if (types.length > 0) {
            searchQuery.query.bool.must.push({
                "terms": {
                    "type": types
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

function parseQueryParamToArray(param) {
    const values = [];
    if (Array.isArray(param)) {
        param.filter(e => e.length > 0).forEach(e => values.push(e));
    } else if ((param !== undefined) && (param.length > 0)) {
        values.push(param);
    }
    return values;
}

module.exports = router;
