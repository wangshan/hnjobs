var https = require("https");
var fs = require("fs");
var JobDatum = require('./models/job');
var CandidateDatum = require('./models/candidate');

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

var topics = [
    //{ title: "hiring"     , text: "Ask HN: Who is hiring.*" }                 ,
    { title: "wantshired" , text: "Ask HN: Who wants to be hired.*" }         ,
    { title: "freelance"  , text: "Ask HN: Freelancer? Seeking freelancer.*" },
    ];

var parseWhosHiring = function(fileName, data, filter) {
    topics.forEach(function(topic) {
        var re = new RegExp(topic.text + filter, "gi");
        if (re.test(data.title)) {
            data.kids.forEach(function(entry) {
                console.log("requesting item/" + entry);
                requestById("item/", entry, function(post) {
                    savePostToDatabase(post, topic.title, filter);
                });
            });
        }

    })
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

// replace html coding with ascii character
String.prototype.decodeHTML = function() {
    var map = {"gt":">" /* , … */};
    return this.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gi, function($0, $1) {
        if ($1[0] === "#") {
            return String.fromCharCode($1[1].toLowerCase() === "x"
                ? parseInt($1.substr(2), 16)
                : parseInt($1.substr(1), 10));
        } else {
            return map.hasOwnProperty($1) ? map[$1] : $0;
        }
    });
};


var savePostToDatabase = function(post, topic, monthPosted) {
    if (topic == "hiring") {
        saveJobToDatabase(post, monthPosted)
    }
    else if (topic == "wantshired") {
        saveCandidateToDatabase(post, monthPosted)
    }
    else if (topic == "freelance") {
        console.log("freelance");
        var seekingFreelancerRe = /SEEKING FREELANCER/gi;
        var seekingWorkRe = /SEEKING WORK/gi;
        if (seekingFreelancerRe.test(post.text)) {
            saveJobToDatabase(post, monthPosted)
        }
        else if (seekingWorkRe.test(post.text)) {
            saveCandidateToDatabase(post, monthPosted)
        }
        else {
            console.log("freelance, post doesn't say what's seeking");
        }
    }
}

var saveCandidateToDatabase = function(candidate, monthPosted) {
    console.log("saveCandidateToDatabase, ", candidate);

    var parttimeRe = /part[\ \-]?time/gi;
    var freelanceRe = /free[\ \-]?lanc/gi;
    var jobType = "Full Time";
    if (parttimeRe.test(candidate.text)) {
        jobType = "Part Time";
    }
    else if (freelanceRe.test(candidate.text)) {
        jobType = "/".join(jobType, "Freelance");
    }

    var candidateDatum = new CandidateDatum({
        id: candidate.id,
        time: candidate.time * 1000,
        monthPosted: monthPosted,
        description: candidate.text,
    });

    // only save if candidate.id is not present
    CandidateDatum.update(
            { id: candidateDatum.id },
            { $setOnInsert: candidateDatum },
            { upsert: true },
            function(err, numAffected) {
                if (err) {
                    console.log("Failed to save a new candidate");
                }
            }
            );
}

var saveJobToDatabase = function(job, monthPosted) {
    // don't show if the text is too short and there's no title
    if ((!job.text || job.text.length < 16) && !job.title) {
        return;
    }
    else {
        if (!job.title) {
            // this is the case for whoishiring posts
            var title = job.text.split(/<[a-zA-Z]|\n/)[0];
            var decodedTitle = title.decodeHTML();
            job.title = decodedTitle.replace(/^[-\|\.\ ]+|[-\|\.\(\[\{\ ,;:]+$/g, '');
            console.log("job.title = " + job.title);
            var titleLine = "job.title = " + job.title + "\n";
        }
        if (!job.text) {
            job.text = job.title;
        }

        var jobType = "Full Time";
        var jobTypeRe = /part[\ \-]?time/gi;
        if (jobTypeRe.test(job.text)) {
            jobType = "Part Time";
        }
        var freelanceRe = /free[\ \-]?lanc/gi;
        if (freelanceRe.test(candidate.text)) {
            jobType = "/".join(jobType, "Freelance");
        }

        var remoteRe = /REMOTE/gi;
        var remote = remoteRe.test(job.text);

        var onsiteRe = /ONSITE/gi;
        var onsite = onsiteRe.test(job.text);

        var jobDatum = new JobDatum({
            id: job.id,
            time: job.time * 1000,
            company: "",
            position: job.title,
            description: job.text,
            url: job.url,
            monthPosted: monthPosted,
            type: jobType,
            where: "",
            remote: remote,
            onsite: onsite,
        });

        // only save if job.id is not present
        JobDatum.update(
                { id: jobDatum.id },
                { $setOnInsert: jobDatum },
                { upsert: true },
                function(err, numAffected) {
                    if (err) {
                        console.log("Failed to save a new job");
                    }
                }
                );
    }

//    JobDatum.findOne(
//            { id: jobDatum.id },
//            function(err, existing) {
//                if (!err) {
//                    if (!existing || existing.time < jobDatum.time) {
//                        existing = jobDatum;
//                    }
//                    existing.save(function(err) {
//                        if (err) {
//                            console.log("Failed to save a new job");
//                        }
//                    });
//                }
//            }
//            );

//    // only save if job.id is not present and timestamp is older
//    // this won't work!
//    JobDatum.update(
//            { $and: [{id: jobDatum.id}, {time: {$lt: jobDatum.time}}] },
//            { $setOnInsert: jobDatum},
//            { upsert: true},
//            function(err, numAffected) {
//                if (err) {
//                    console.log("Failed to save a new job");
//                }
//            }
//            );

}

var getJobs = function(fileName) {
    return requestById("", "jobstories", function(jobIds) {
        //console.log(jobIds);
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
            //console.log("id: ", id);
            requestById("item/", id, function(data) {
                parseWhosHiring(fileName, data, filter);
            });
        });
    });
}

module.exports.getJobs = getJobs;
module.exports.getWhoIsHiring = getWhoIsHiring;

