var db = require('../db');
var DateLabel = db.model('DateLabel', {
    month: { type: Date, required: true },
});

module.exports = DateLabel;
