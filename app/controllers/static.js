var path = require('path');
var express = require('express');
var router = express.Router();

router.use('/static', express.static(__dirname + '/../../public'));
router.use('/bower_components', express.static(__dirname + '/../../bower_components'));

router.get('/', function(req, res) {
    // sendFile doesn't like .. in the path, so have to resolve it
    var resolvedFile = (process.env.NODE_ENV == "Production")
                       ? path.resolve('public/layouts/index.html') 
                       : path.resolve('public/layouts/index_dev.html');

    console.log(resolvedFile);
    res.sendFile(resolvedFile);
});

module.exports = router;
