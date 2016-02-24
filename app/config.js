// configurations that depends on environment

var config = function(property) {
    var _config = {
        db: 'mongodb://dbuser:dbpassword@ds013908.mongolab.com:13908/heroku_g44fx66v',
    };

    if (process.env.NODE_ENV != 'production') {
        _config.db = 'mongodb://localhost/hnjobs';
    }

    return _config[property];
}

module.exports = config;
