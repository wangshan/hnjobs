var mongoose = require('mongoose');
var confg = require('./config');

mongoose.connect(config.database,
        function(error) {
            if (error) {
                console.log('failed to connect mongodb', error);
            }
            else {
                console.log('mongodb connected');
            }
        });

module.exports = mongoose;
