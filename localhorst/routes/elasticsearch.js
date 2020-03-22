'use strict';

const express = require('express');
const router = express.Router();

const { Client } = require('@elastic/elasticsearch');

const elasticsearchNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const index = process.env.ELASTICSEARCH_INDEX || 'recommendations';
const client = new Client({ node: elasticsearchNode });

router.get('/get-all-resources', (req, res, next) => {
    res.render('index', { title: 'Elasticsearch Result' });
});

router.get('/filter-resources', (req, res) => {
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
