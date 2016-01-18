var router = require('express').Router();

router.get('/', function(req, res) {
    res.sendfile('layouts/jobs.html');
});

module.exports = router;
