#!/usr/bin/env node

var https = require("https");
var fs = require("fs");

var requestById = function(type, id, onEnd) {
    var options = {
        hostname: "hacker-news.firebaseio.com",
        path: "/v0/" + type + id + ".json?print=pretty",
        method: "GET",
        headers: { Accept: "text/html" }
    };

    var request = https.request(options,
        function(response) {
            console.log("Server responded with status code: ", response.statusCode);
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
        console.error(e);
    });
}

var parseWhosHiring = function(fileName, data) {
    var whoIsHiringTitle = /Ask HN: Who is hiring.*December 2015/;
    if (whoIsHiringTitle.test(data.title)) {
        console.log("--\n", data, "--\n");
        data.kids.forEach(function(entry) {
            console.log(entry);
            requestById("item/", entry, function(job) {
                saveJobDetail(fileName, JSON.stringify(job, null, 4));
            });
        });
    }
}

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

requestById("", "jobstories", function(jobIds) {
    console.log(jobIds);
    jobIds.forEach(function(jobId) {
        requestById("item/", jobId, function(job) {
            saveJobDetail("./jobs.txt", JSON.stringify(job, null, 4));
        });
    });    
});

requestById("user/", "whoishiring", function(whoishiring) {
    var postIds = whoishiring.submitted;
    postIds.forEach(function(id) {
        console.log("id: ", id);
        requestById("item/", id, function(data) {
            parseWhosHiring("./whoishiring.txt", data);
        });
    });
});

console.log("starting...");
