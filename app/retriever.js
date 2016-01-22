var hnjobs = require('./hnjobs');
var CronJob = require('cron').CronJob;

console.log("starting...");

var cronJob = new CronJob('*/30 * * * * *', function() {
    hnjobs.getJobs('../data/jobs2.txt');
}, null, true);

