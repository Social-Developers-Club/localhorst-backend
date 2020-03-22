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

router.get('/filter-resources', (req, res) => {
    const client = new Client({ node: elasticsearchNode });
    const { category, industry, type, text } = req.body;

    let searchQuery = {
        "query": {
            "bool": {
                "must": []
            }}};

    if (category) {
        searchQuery.query.bool.must.push({
            "term": {
                "category": {
                    "value": category
                }}})}

    if (industry) {
        searchQuery.query.bool.must.push({
            "term": {
                "industry": {
                    "value": industry
                }}})}

    if (type) {
        searchQuery.query.bool.must.push({
            "term": {
                "type": {
                    "value": type
                }}})}

    if (text) {
        searchQuery.query.bool.must.push({
            "match": {
                "recommendation": text
            }})}

    let searchResults = {}
    client.search({ index, body: searchQuery }).then(x => searchResults = x)


});

module.exports = router;
