#!/usr/bin/env node

var https = require("https");
var fs = require("fs");
//var Firebase = require("firebase");
//var itemRef = new Firebase('https://hacker-news.firebaseio.com/v0/item');

var requestWhosHiring = function() {
    var options = {
        hostname: "hacker-news.firebaseio.com",
        path: "/v0/askstories.json?print=pretty",
        method: "GET",
        headers: { Accept: "text/html" }
    };

    var whoIsHiring = /Ask HN: Who is hiring.*/;
    var request = https.request(options,
        function(response) {
            console.log("Server responded with status code: ", response.statusCode);
            console.log("Server responded with header: ", response.headers);
            var body = "";
            response.on("data", function(chunk) {
                process.stdout.write(chunk);
                //process.stdout.write(typeof(chunk));
                if (whoIsHiring.test(chunk.title)) {
                    console.log("--", chunk);
                    body += chunk;
                }
            });
            response.on('end', function() {
                console.log(body);
                fs.appendFile("./whoishiring.txt", body, function(err) {
                    if (err) {
                        console.log("Failed to write to file: ", err);
                    }
                    else {
                        //console.log("File written");
                    }
                });
            });
        });
    request.end();
}

var requestJobDetail = function(id) {
    var options2 = {
        hostname: "hacker-news.firebaseio.com",
        path: "/v0/item/" + id + ".json?print=pretty",
        method: "GET",
        headers: { Accept: "text/html" }
    };

    var request = https.request(options2,
        function(response) {
            //console.log("Server responded with status code: ", response.statusCode);
            //console.log("Server responded with header: ", response.headers);
            var body = "";
            response.on("data", function(chunk) {
                process.stdout.write(chunk);
                body += chunk;
            });
            response.on('end', function() {
                //console.log(body);
                fs.appendFile("./jobs.txt", body, function(err) {
                    if (err) {
                        console.log("Failed to write to file: ", err);
                    }
                    else {
                        //console.log("File written");
                    }
                });
            });
        });
    request.end();
}

var options = {
    hostname: "hacker-news.firebaseio.com",
    path: "/v0/jobstories.json?print=pretty",
    method: "GET",
    headers: { Accept: "text/html" }
};

var request = https.request(options,
    function(response) {
        //console.log("Server responded with status code: ", response.statusCode);
        //console.log("Server responded with header: ", response.headers);
        var body = "";
        response.on("data", function(chunk) {
            //process.stdout.write(chunk);
            body += chunk;
            //console.log("type of chunk: ", typeof(chunk));
        });
        response.on('end', function() {
            //console.log(body);
            var jobIds = JSON.parse(body);
            //console.log(jobIds);
            for (var i = jobIds.length-1; i >=0; i--) {
                console.log("id: ", jobIds[i]);
                requestJobDetail(jobIds[i]);
            }
            requestWhosHiring();
            //console.log("\nResponse ended\n");
        });
    }
    );

request.end();

request.on("error", function(e) {
    console.error(e);
});

console.log("hello");
