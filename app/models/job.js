var db = require('../db');
var Job = db.model('Job', {
    id: { type: String, required: true },
    time: { type: Number, required: true },
    company: { type: String, required: false },
    position: { type: String, required: false },
    description: { type: String, required: false },
    url: { type: String, required: false },
});

module.exports = Job;
