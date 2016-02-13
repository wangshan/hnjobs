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

var saveNewDateLabel = function(dateLabels, newDate) {
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

                // kick out the oldest if new one has been added
                // NOTE: whoishiring for the new month may have not been posted
                // yet, but we remove the old one anyway, because frontend only
                // shows one less months' data
                if (dateLabels.length > 4) {
                    dateLabels.shift();
                }
                else if (dateLabels.length < 4) {
                    // FIXME: if there are >= 4 date labels, even the actual
                    // data is empty, we still only request the latest month,
                    // maybe I should try
                    // 1) check data by month and request if that
                    // month is empty
                    // 2) add a force flag and pass from command line, I think
                    // this is a better solution
                    var prevDate = getPrevMonthYear(newDateLabel.month);
                    saveNewDateLabel(dateLabels, prevDate);
                }
            }

            // will still get the posts even datelabels failed to save
            console.log("Getting " + newDate);
            HnJobs.getWhoIsHiring('../data/whoishiring.txt', getMonthYearText(newDate));
        });
}

var retrieve = function() {
    var now = new Date();
    var dateText = getMonthYearText(now);
    var newDate = new Date(dateText);
    DateLabel.find()
        .sort("-month")
        .exec(function(err, dateLabels) {
            if (err) {
                // still try to get new posts even datalabel fetch failed
                console.log("Failed to find date labels, will not refresh jobs");
            }
            else {
                var latestIndex = _.findIndex(dateLabels, function(o) {
                    return o.month == newDate;
                });

                if (latestIndex == -1) {
                    console.log("lastestIndex==-1, new date appeared");
                    saveNewDateLabel(dateLabels, newDate);
                }
                else if (latestIndex == 0) {
                    console.log("lastestIndex==0, current date is the latest");
                    // should only happen during developing
                    if (dateLabels.length < 4) {
                        var prevDate = getPrevMonthYear(newDate);
                        saveNewDateLabel(dateLabels, prevDate);
                    }
                }
                else {
                    // latestIndex is not current month, shouldn't happen
                    console.log("Current date: " + newDate +
                            "is not the lastest saved in database: "
                            + dateLabels[latestIndex].month);
                }
            }
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

