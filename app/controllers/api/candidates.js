var Candidate = require('../../models/candidate');
var router = require('express').Router();

router.get('/', function(req, res, next) {
    Candidate.find()
    .sort('-time')
    .exec(function(err, candidates) {
        if (err) {
            console.log("Can't find any candidates");
            return next(err);
        }
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.json(candidates);
    });
});

router.get('/:id', function(req, res, next) {
    Candidate.findOne({id: req.params.id}, function(err, candidate) {
        if (err) {
            console.log("Can't find any candidate with id " + req.params.id);
            return next(err);
        }
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.json(candidate);
    });
});

router.get('/months/:month', function(req, res, next) {
    var month = decodeURI(req.params.month);
    Candidate.find({monthPosted: month}, function(err, candidates) {
        if (err) {
            console.log("Can't find any candidates in month " + req.params.monthPosted);
            return next(err);
        }
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.json(candidates);
    });
});

module.exports = router;
