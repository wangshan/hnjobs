var db = require('../db');
var DateLabel = db.model('DateLabel', {
    month: { type: String, required: true },
    timestamp: { type: Date, required: false },
});

module.exports = DateLabel;
