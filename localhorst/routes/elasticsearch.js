'use strict';

const express = require('express');
const router = express.Router();

router.get('/get-all-resources', (req, res, next) => {
    res.render('index', { title: 'Elasticsearch Result' });
});

router.get('/filter-resources', (req, res) => {
    let { category, industry, type, text } = req.body
    res.send({
        category,
        industry,
        type,
        text
    })
});

module.exports = router;
