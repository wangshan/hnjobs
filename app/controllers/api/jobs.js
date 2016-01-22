var Job = require('../../models/job');
var router = require('express').Router();

router.get('/', function(req, res, next) {
    Job.find()
    .sort('-date')
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
        company: req.body.company,
        position: req.body.position,
        date: req.body.time,
        description: req.body.description,
    });

    newJob.save(function(err, job) {
        if (err) {
            return next(err);
        }
        res.json(201, job);
    });
});

module.exports = router;
