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
        res.set({'Cache-Control': 'public, max-age=86400'});
        res.json(dates);
    });
});

module.exports = router;
