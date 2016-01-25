var hnjobs = require('./hnjobs');
var CronJob = require('cron').CronJob;

console.log("starting...");

//var cronGetJob = new CronJob('*/30 * * * * *', function() {
//    hnjobs.getJobs('../data/jobs2.txt');
//}, null, true);
//
//var cronWhoIsHiring = new CronJob('* * * */1 * *', function() {
//    hnjobs.getWhoIsHiring('../data/whoishiring2.txt', "December 2015");
//}, null, true);

hnjobs.getWhoIsHiring('../data/whoishiring2.txt', "December 2015");
