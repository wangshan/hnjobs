var db = require('../db');
var LatestTs = db.model('LatestTs', {
    timestamp: { type: String, required: true },
});

module.exports = LatestTs;
