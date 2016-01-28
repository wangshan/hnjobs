'use strict';

angular.module('confusionApp')
        .constant("baseURL", "http://localhost:3000/api/")
        .service('hnJobsFactory', ['$resource', 'baseURL', function($resource, baseURL) {
            this.getHnJobs = function() {
                return $resource(baseURL + "jobs/:id", null, {'update': {method: 'PUT'}}); 
            };
        }])

        .factory('corporateFactory', ['$resource', 'baseURL', function($resource, baseURL) {
    
            var corpfac = {};
    
            corpfac.getLeaders = function() {
                
                return $resource(baseURL + "leadership/:id", null, {'update':{method: 'PUT'}}); 
            };

            return corpfac; 
    
        }])

        .service('feedbackFactory', ['$resource', 'baseURL', function($resource, baseURL) {

            this.getFeedback = function() {
                return $resource(baseURL + "feedback/:id", null, {'save':{method: 'POST'}}); 
            }
        }])

;
