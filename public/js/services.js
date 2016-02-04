'use strict';

angular.module('confusionApp')
        .constant("baseURL", "http://localhost:3000/api/")
        .service('hnJobsFactory', ['$resource', 'baseURL', function($resource, baseURL) {
            this.getHnJobs = function() {
                return $resource(baseURL + "jobs/:id", null, {'update': {method: 'PUT'}}); 
            };
        }])

        .service('dateLabelsFactory', ['$resource', 'baseURL', function($resource, baseURL) {
            var parseResponseDates = function(response) {
                // convert response.data to an array of Date
                var dates = [];
                var data = response.data;
//                console.log("parseResponseDates, data.length=" + data.length);
                var key;
                var value;
                for (key in data) {
//                    console.log("parseResponseDates, raw=", data[key]);
                    if (!data.hasOwnProperty(key) && // don't parse prototype or non-string props
                        toString.call(data[key]) !== '[object String]') continue;
                    value = Date.parse(data[key].month); // try to parse to date
                    if (value !== NaN) {
//                        console.log("parseResponseDates, parsed=", value);
                        //data[key] = value;
                        dates.push(new Date(value));
                    }
                }
                return dates;
            };

            this.getDateLabels = function() {
                return $resource(baseURL + "datelabels/:id", null, {
                    'query': {
                       method: 'GET',
                       isArray: true,
                       interceptor: {response: parseResponseDates}
                    },
                    'update': {
                       method: 'PUT'
                    }
                }
                );
            };
        }])

        .service('corporateFactory', ['$resource', 'baseURL', function($resource, baseURL) {
            this.getLeaders = function() {
                return $resource(baseURL + "leadership/:id", null, {'update':{method: 'PUT'}}); 
            };
        }])

        .service('feedbackFactory', ['$resource', 'baseURL', function($resource, baseURL) {
            this.getFeedback = function() {
                return $resource(baseURL + "feedback/:id", null, {'save':{method: 'POST'}}); 
            }
        }])

;
