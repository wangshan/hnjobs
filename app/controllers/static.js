var path = require('path');
var express = require('express');
var router = express.Router();

var cacheTime = 86400 * 1000;
var cacheTimeFor3rdParty = 86400 * 1000 * 7;

router.use('/static', express.static(
            __dirname + '/../../public',
            { maxAge: cacheTime })
        );
router.use('/bower_components', express.static(
            __dirname + '/../../bower_components',
            { maxAge: cacheTimeFor3rdParty })
        );

router.get('/', function(req, res) {
    // sendFile doesn't like .. in the path, so have to resolve it
    var resolvedFile = (process.env.NODE_ENV == "Production")
                       ? path.resolve('public/layouts/index.html') 
                       : path.resolve('public/layouts/index_dev.html');

    console.log(resolvedFile);
    res.set({'Cache-Control': 'public, max-age=86400'});
    res.sendFile(resolvedFile);
});

module.exports = router;
