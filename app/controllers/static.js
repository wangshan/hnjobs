var path = require('path');
var express = require('express');
var router = express.Router();

router.use('/assets', express.static(__dirname + '/../assets'));

router.get('/', function(req, res) {
    // sendFile doesn't like .. in the path, so have to resolve it
    //res.sendFile(__dirname + '/../layouts/index.html');
    var resolvedFile = path.resolve('layouts/index.html');
    console.log(resolvedFile);
    res.sendFile(resolvedFile);
});

module.exports = router;
