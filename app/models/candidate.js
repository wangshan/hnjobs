var db = require('../db');

// How can I inherit a schema? the first 4 field is common between all
// whoishiring posts
var Candidate = db.model('Candidate', {
    id:             { type: String,     required: true },
    time:           { type: Number,     required: true },
    source:         { type: String,     required: true, default: "Who Is Hiring" },
    monthPosted:    { type: String,     required: true },
    description:    { type: String,     required: false },
});

module.exports = Candidate;
