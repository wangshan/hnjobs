var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use('/api/jobs', require('./controllers/api/jobs'));
app.use('/api/datelabels', require('./controllers/api/datelabels'));
app.use('/',         require('./controllers/static'));

app.listen(3000, function() {
    console.log('Server listening on', 3000);
})
