var https = require("https");
var fs = require("fs");
var JobDatum = require('./models/job');

var requestById = function(type, id, onEnd) {
    var options = {
        hostname: "hacker-news.firebaseio.com",
        path: "/v0/" + type + id + ".json?print=pretty",
        method: "GET",
        headers: { Accept: "text/html" }
    };

    var request = https.request(options,
        function(response) {
            //console.log("Server responded with status code: ", response.statusCode);
            //console.log("Server responded with header: ", response.headers);
            var body = "";
            response.on("data", function(chunk) {
                body += chunk;
            });
            response.on('end', function() {
                var content = JSON.parse(body);
                onEnd(content);
            });
        });
    request.end();

    request.on("error", function(e) {
        console.error("request has error: " + e);
    });
}

// TODO: filter based on current date?

var parseWhosHiring = function(fileName, data, filter) {
    var re = new RegExp("Ask HN: Who is hiring.*" + filter, "gi");
    if (re.test(data.title)) {
        console.log("--\n", data, "--\n");
        data.kids.forEach(function(entry) {
            console.log("requesting item/" + entry);
            requestById("item/", entry, function(job) {
                // TODO: need to parse job.text
//                saveJobDetail(fileName, JSON.stringify(job, null, 4));
                saveJobToDatabase(job);
            });
        });
    }
}

// for debugging only
var saveJobDetail = function(fileName, data) {
    console.log(data);
    console.log("-----");
    fs.appendFile(fileName, data, function(err) {
        if (err) {
            console.log("Failed to write to file: ", err);
        }
        else {
            console.log("File ", fileName, " written");
        }
    });
}

var saveJobToDatabase = function(job) {
//    console.log("saving..." + job.id);
//    var date_ = new Date(job.time * 1000);
//    console.log("timestamp = " + job.time + ", date = " + date_);
    var jobDatum = new JobDatum({
        id: job.id,
        time: job.time * 1000,
        company: job.title,
        position: job.title,
        description: job.text,
        url: job.url,
    });

    // only save if job.id is not present and timestamp received is newer
    JobDatum.update(
            { $and: [{id: jobDatum.id}, {time: {$lt: jobDatum.time}}] },
            { $setOnInsert: jobDatum},
            { upsert: true},
            function(err, numAffected) {
                if (err) {
                    console.log("Failed to save a new job");
                }
            }
            );
}

var getJobs = function(fileName) {
    return requestById("", "jobstories", function(jobIds) {
        console.log(jobIds);
        jobIds.forEach(function(jobId) {
            requestById("item/", jobId, function(job) {
                saveJobToDatabase(job);
            });
        });
    });
}

var getWhoIsHiring = function(fileName, filter) {
    return requestById("user/", "whoishiring", function(whoishiring) {
        var postIds = whoishiring.submitted;
        postIds.forEach(function(id) {
            console.log("id: ", id);
            requestById("item/", id, function(data) {
                parseWhosHiring(fileName, data, filter);
            });
        });
    });
}

module.exports.getJobs = getJobs;
module.exports.getWhoIsHiring = getWhoIsHiring;

