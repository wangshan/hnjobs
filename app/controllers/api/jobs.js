var Job = require('../../models/job');
var router = require('express').Router();

router.get('/', function(req, res, next) {
    Job.find()
    .sort('-date')
    .exec(function(err, jobs) {
        if (err) {
            return next(err);
        }
        res.json(jobs);
    });
});

router.post('/', function(req, res, err) {
    var newJob = new Job({
        id: req.body.id,
        company: req.body.company,
        title: req.body.title,
        date: req.body.date,
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
