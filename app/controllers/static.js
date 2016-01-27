var path = require('path');
var express = require('express');
var router = express.Router();

router.use('/static', express.static(__dirname + '/../../public'));
router.use('/bower_components', express.static(__dirname + '/../../bower_components'));

router.get('/', function(req, res) {
    // sendFile doesn't like .. in the path, so have to resolve it
    var resolvedFile = path.resolve('../public/layouts/index.html');
    console.log(resolvedFile);
    res.sendFile(resolvedFile);
});

module.exports = router;
