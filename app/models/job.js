var db = require('../db');
var Job = db.model('Job', {
    id: { type: String, required: true },
    company: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: false },
});

module.exports = Job;
