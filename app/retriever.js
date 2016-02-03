var HnJobs = require('./hnjobs');
var DateLabel = require('./models/date_label');
var CronJob = require('cron').CronJob;
var _ = require('lodash');
var MonthYear = require('./month_year');

console.log("starting...");

var getMonthName = function(date) {
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

var getMonthYearText = function(date) {
    if (!_.isDate(date)) {
        console.log("getMonthYearText, parameter is not a date: ", date);
        return "";
    }
    return getMonthName(date) + " " + date.getFullYear();
}

var getPrevMonthYear = function(date) {
    if (!_.isDate(date)) {
        console.log("getPrevMonthYear, parameter is not a date: ", date);
        return null;
    }
    var prevMonth = date.getMonth() == 0 ? 11 : date.getMonth()-1;
    var prevYear = date.getMonth() == 0 ? date.getFullYear()-1 : date.getFullYear();
    var prevDate = new Date(date);
    prevDate.setMonth(prevMonth);
    prevDate.setFullYear(prevYear);
    return prevDate;
}

var saveNewDateLabel = function(dateLabels, datesToRequest, newDate) {
    console.log("saveNewDateLabel, newDate=", newDate);
    var newDateLabel = new DateLabel({
        month: newDate,
    });
    DateLabel.update(
        { month: newDateLabel.month },
        { $setOnInsert: newDateLabel },
        { upsert: true },
        function(err, numAffected) {
            if (err) {
                console.log("Failed to save date labels");
            }
            else {
                dateLabels.push(newDateLabel);
                datesToRequest.push(newDateLabel.month);

                // kick out the oldest if new one has been added
                // NOTE: whoishiring for the new month may have not been posted
                // yet, but we remove the old one anyway, because frontend only
                // shows one less months' data
                if (dateLabels.length > 4) {
                    dateLabels.shift();
                }
                else if (dateLabels.length < 4) {
                    var prevDate = getPrevMonthYear(newDateLabel.month);
                    saveNewDateLabel(dateLabels, datesToRequest, prevDate);
                }
            }
        });
}

var retrieve = function() {
    var datesToRequest = [];
    var now = new Date();
    var dateText = getMonthYearText(now);
    var newDate = new Date(dateText);
    DateLabel.find()
        .sort("-month")
        .exec(function(err, dateLabels) {
            if (err) {
                console.log("Failed to find date labels");
                datesToRequest.push(newDate);
            }
            else {
                var latestIndex = _.findIndex(dateLabels, function(o) {
                    return o.month == newDate;
                });

                if (latestIndex == -1) {
                    saveNewDateLabel(dateLabels, datesToRequest, newDate);
                }
                else if (latestIndex == 0) {
                    // should only happen during developing
                    datesToRequest.push(newDate);
                    if (dateLabels.length < 4) {
                        var prevDate = getPrevMonthYear(newDate);
                        saveNewDateLabel(dateLabels, datesToRequest, prevDate);
                    }
                }
                else {
                    // latestIndex is not current month, shouldn't happen
                    console.log("Current date: " + newDate +
                            "is not the lastest saved in database: "
                            + dateLabels[latestIndex].month);
                }
            }

            _.forEach(datesToRequest, function(d) {
                console.log("...to request " + getMonthYearText(d));
                HnJobs.getWhoIsHiring('../data/whoishiring.txt', getMonthYearText(d));
            });
        });
}

retrieve();

//var cronGetJob = new CronJob('*/30 * * * * *', function() {
//    HnJobs.getJobs('../data/jobs.txt');
//}, null, true);
//
//var cronWhoIsHiring = new CronJob('* * * */1 * *', function() {
//    retrieve();
//}, null, true);

