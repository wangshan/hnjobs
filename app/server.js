var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');

var app = express();

app.set('port', (process.env.PORT || 3000));

app.use(bodyParser.json());
app.use(compression());
app.use('/api/jobs',       require('./controllers/api/jobs'));
app.use('/api/candidates', require('./controllers/api/candidates'));
app.use('/api/datelabels', require('./controllers/api/datelabels'));
app.use('/',               require('./controllers/static'));

app.listen(app.get('port'), function() {
    console.log('Server listening on', app.get('port'));
})
