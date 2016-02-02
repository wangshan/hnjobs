var DateLabel = require('../../models/date_label');
var router = require('express').Router();

router.get('/', function(req, res, next) {
    DateLabel.find()
    .sort('-month')
    .exec(function(err, dates) {
        if (err) {
            console.log("Can't find any date labels");
            return next(err);
        }
        res.json(dates);
    });
});

module.exports = router;
