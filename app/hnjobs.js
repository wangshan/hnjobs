var HnJobs = require('./requester');
var DateLabel = require('./models/date_label');
var CronJob = require('cron').CronJob;
var _ = require('lodash');
var MonthYear = require('./month_year');

var argv = require('yargs')
    .usage('Usage: node $0 [options]')
    .help('h')
    .alias('h', 'help')
    .boolean(['f', 'd'])
    .alias('f', 'force')
    .describe('f', 'Force refresh database')
    .default('f', false)
    .alias('d', 'debug')
    .describe('d', 'Run in debug mode')
    .default('d', false)
    .demand(['m'])
    .alias('m', 'mode')
    .choices(['oneoff', 'daemon'])
    .describe('m', 'Running mode, daemon mode will refresh database regularly')
    .default('m', 'oneoff')
    .argv;
 
console.log("starting...");

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
                else if (dateLabels.length < 4 || argv.f ) {
                    // FIXME: if there are >= 4 date labels, even the actual
                    // data is empty, we still only request the latest month,
                    // maybe I should try
                    // 1) check data by month and request if that
                    // month is empty
                    // 2) add a force flag and pass from command line, I think
                    // this is a better solution
                    var prevDate = MonthYear.getPrevMonthYear(newDateLabel.month);
                    saveNewDateLabel(dateLabels, prevDate);
                }
            }

            // will still get the posts even datelabels failed to save
            console.log("Getting " + newDate);
            HnJobs.getWhoIsHiring('../data/whoishiring.txt', MonthYear.getMonthYearText(newDate));
        });
}

var retrieve = function() {
    var now = new Date();
    var dateText = MonthYear.getMonthYearText(now);
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
                        var prevDate = MonthYear.getPrevMonthYear(newDate);
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

if (argv.m == 'oneoff') {
    retrieve();
}
else if (argv.m == 'daemon') {
    var cronWhoIsHiring = new CronJob({
        cronTime: '00 03 21 * * *',
        onTick: function() {
            retrieve();
        },
        start: true,
        runOnInit: true
    });
}

//var cronGetJob = new CronJob('*/30 * * * * *', function() {
//    HnJobs.getJobs('../data/jobs.txt');
//}, null, true);
//

