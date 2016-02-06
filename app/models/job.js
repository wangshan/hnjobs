var db = require('../db');
var Job = db.model('Job', {
    id: { type: String, required: true },
    time: { type: Number, required: true },
    company: { type: String, required: false },
    position: { type: String, required: false },
    description: { type: String, required: false },
    url: { type: String, required: false },
    source: { type: String, required: true, default: "HackerNews" },
    monthPosted: { type: String, required: true },
    type: { type: String, required: false }, // fulltime, partime, freelance
    where: { type: String, required: false },
});

module.exports = Job;
