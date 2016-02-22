var mongoose = require('mongoose');

mongoose.connect('mongodb://dbuser:dbpassword@ds013908.mongolab.com:13908/heroku_g44fx66v',
        function(error) {
            if (error) {
                console.log('failed to connect mongodb', error);
            }
            else {
                console.log('mongodb connected');
            }
        });

module.exports = mongoose;
