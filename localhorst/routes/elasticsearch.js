'use strict';

const express = require('express');
const router = express.Router();

router.get('/get-all-resources', (req, res, next) => {
    res.render('index', { title: 'Elasticsearch Result' });
});

module.exports = router;
