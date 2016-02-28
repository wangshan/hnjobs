var _ = require('lodash');

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
    var prevMonth = date.getMonth() === 0 ? 11 : date.getMonth()-1;
    var prevYear = date.getMonth() === 0 ? date.getFullYear()-1 : date.getFullYear();
    var prevDate = new Date(date);
    prevDate.setMonth(prevMonth);
    prevDate.setFullYear(prevYear);
    return prevDate;
}

module.exports.getMonthName = getMonthName;
module.exports.getMonthYearText = getMonthYearText;
module.exports.getPrevMonthYear = getPrevMonthYear;

