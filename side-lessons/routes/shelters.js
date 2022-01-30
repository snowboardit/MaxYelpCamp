const express = require('express');
const router = express.Router();

router.get('/shelters', (req, res) => {
    res.send("all shelters");

});

router.post('/shelters', (req, res) => {
    res.send("Creating shelter");

});

router.get('/shelters/:id', (req, res) => {
    res.send("shelter id");

});

router.get('/shelters/:id/edit', (req, res) => {
    res.send("edit shelter");

});

module.exports = router;