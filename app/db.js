var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/hnjobs', function() {
        console.log('mongodb connected');
        });

module.exports = mongoose;
