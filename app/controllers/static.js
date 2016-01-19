var express = require('express');
var router = express.Router();

router.use(express.static(__dirname + '/../assets'));

router.get('/', function(req, res) {
    res.sendfile('layouts/jobs.html');
});

module.exports = router;
