var Job = require('../../models/job');
var router = require('express').Router();

router.get('/', function(req, res, next) {
    Job.find()
    .sort('-time')
    .exec(function(err, jobs) {
        if (err) {
            console.log("Can't find any jobs");
            return next(err);
        }
        res.json(jobs);
    });
});

router.get('/:id', function(req, res, next) {
    Job.find({id: req.params.id})
    .sort('-time')
    .exec(function(err, jobs) {
        if (err) {
            console.log("Can't find any jobs");
            return next(err);
        }
        res.json(jobs);
    });
});

router.get('/:month', function(req, res, next) {
    Job.find({month: req.params.month})
    .sort('-month')
    .exec(function(err, jobs) {
        if (err) {
            console.log("Can't find any jobs");
            return next(err);
        }
        res.json(jobs);
    });
});

router.post('/', function(req, res, err) {
    var newJob = new Job({
        id: req.body.id,
        time: req.body.time,
        company: req.body.company,
        position: req.body.position,
        description: req.body.description,
        url: req.body.url,
    });

    newJob.save(function(err, job) {
        if (err) {
            return next(err);
        }
        res.json(201, job);
    });
});

module.exports = router;
