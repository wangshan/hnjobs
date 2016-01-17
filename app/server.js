var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.get('/api/jobs', function(req, res){
    res.json([
        {
            jobId: '#123456',
            description: 'fullstack engineer'
        }
        ])
})

app.listen(3000, function() {
    console.log('Server listening on', 3000);
})
