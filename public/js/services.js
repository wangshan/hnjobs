'use strict';

angular.module('startupJobsApp')
        .constant("baseURL", "http://localhost:3000/api/")
        .service('hnJobsFactory', ['$resource', 'baseURL', function($resource, baseURL) {
            this.getHnJobs = function() {
                return $resource(baseURL + "jobs/:id", null, {
                        'update': {
                            method: 'PUT'
                        },
                        'query': {
                            method: 'GET',
                            cache: true,
                            isArray: true
                        }
                    }); 
            };

            this.getHnCandidates = function() {
                return $resource(baseURL + "candidates/:id", null, {
                        'update': {
                            method: 'PUT'
                        },
                        'query': {
                            method: 'GET',
                            cache: true,
                            isArray: true
                        },
                    }); 
            };
        }])

        .service('dateLabelsFactory', ['$resource', 'baseURL', function($resource, baseURL) {
            var parseResponseDates = function(response) {
                // convert response.data to an array of Date
                var dates = [];
                var data = response.data;
                var key;
                var value;
                for (key in data) {
                    if (!data.hasOwnProperty(key) && // don't parse prototype or non-string props
                        toString.call(data[key]) !== '[object String]') continue;
                    value = Date.parse(data[key].month); // try to parse to date
                    if (value !== NaN) {
                        dates.push(new Date(value));
                    }
                }
                return dates;
            };

            this.getDateLabels = function() {
                return $resource(baseURL + "datelabels/:id", null, {
                    'query': {
                       method: 'GET',
                       cache: true,
                       isArray: true,
                       interceptor: {response: parseResponseDates}
                    },
                    'update': {
                       method: 'PUT'
                    }
                });
            };
        }])

        .service('feedbackFactory', ['$resource', 'baseURL', function($resource, baseURL) {
            /*
            this.getFeedback = function() {
                return $resource(baseURL + "feedback/:id", null, {'save':{method: 'POST'}}); 
            }
            */
        }])

;
