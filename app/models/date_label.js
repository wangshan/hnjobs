var db = require('../db');
var DateLabel = db.model('DateLabel', {
    month: { type: String, required: true },
    timestamp: { type: Date, required: true },
});

module.exports = DateLabel;
