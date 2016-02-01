var HnJobs = require('./hnjobs');
var DateLabel = require('./models/date_label');
var CronJob = require('cron').CronJob;
var _ = require('lodash');

console.log("starting...");

var getMonthName = function(date) {
    // TODO: use lodash to check type of date
    var monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    return monthNames[date.getMonth()];
}

var now = new Date();
var dateText = getMonthName(now) + " " + now.getFullYear();
var newDate = new Date(dateText);
DateLabel.find()
    .sort("-month")
    .exec(function(err, dates) {
        if (err) {
            console.log("Failed to find date labels");
        }
        else {
            var latestIndex = _.findIndex(dates, function(o) {
                return o.month == newDate;
            });

            if (latestIndex == -1) {
                var newDateLabel = new DateLabel({
                        month: newDate,
                        timestamp: now.getTime()
                    });
                dates.push(newDateLabel);
                newDateLabel.save(function(err, date) {
                    if (err) {
                        console.log("Failed to save date labels");
                    }
                });

                // kick out the oldest if new one has been added
                // NOTE: whoishiring for the new month may have not been posted
                // yet, but we remove the old one anyway, because frontend only
                // shows one less months' data
                if (dates.length > 4) {
                    dates.shift();
                }
            }
            else if (latestIndex == 0) {
                var date = dates[latestIndex].month;
            }
            else {
                // latestIndex is not current month, shouldn't happen
                console.log("Current date: " + newDate +
                        "is not the lastest saved in database: "
                        + dates[latestIndex].month);
            }
            // if newDate is latest, retrieve, otherwise, reset it to latest in dateLabels
            console.log("...to request " + dateText);
        }
    });

//HnJobs.getWhoIsHiring('../data/whoishiring2.txt', dateText);

//var cronGetJob = new CronJob('*/30 * * * * *', function() {
//    HnJobs.getJobs('../data/jobs2.txt');
//}, null, true);
//
//var cronWhoIsHiring = new CronJob('* * * */1 * *', function() {
//    HnJobs.getWhoIsHiring('../data/whoishiring2.txt', dateText);
//}, null, true);

