'use strict';

angular.module('startupJobsApp')
    .service('hnJobsFactory',
        ['$resource', 'apiEndpoint', function($resource, apiEndpoint) {
        this.getHnJobs = function() {
            return $resource(apiEndpoint + "jobs/:id", null, {
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

        this.getHnJobsByMonth = function() {
            return $resource(apiEndpoint + "jobs/months/:month", null, {
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
            return $resource(apiEndpoint + "candidates/:id", null, {
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

        this.getHnCandidatesByMonth = function() {
            return $resource(apiEndpoint + "candidates/months/:month", null, {
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

    .service('dateLabelsFactory',
        ['$resource', 'apiEndpoint', function($resource, apiEndpoint) {
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
            return $resource(apiEndpoint + "datelabels/:id", null, {
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

    .service('rememberPositionService', function() {
        return {
            scrollTop: undefined
        };
    })

    .service('cacheStateService', ['$window', '$rootScope',
        function($window, $rootScope) {

        var initialUserData = {
            tab: 0,
            showJob: true, // show jobs or candidates
            filtType: undefined,
            filtMonth: undefined,
            searchPattern: undefined,
            totalDisplayed: 50,
        }

        var model = {
            userData: initialUserData,
            setData: setData,
        };

        var saveData = function() {
            $window.sessionStorage.userData = angular.toJson(model.userData);
            console.log("to save data");
        }

        var restoreData = function() {
            var data = angular.fromJson($window.sessionStorage.userData);
            // convert from string
            data.filtMonth = new Date(data.filtMonth);
            model.userData = data;
            console.log("to restore data");
        }

        // restore data on initialization
        if ($window.sessionStorage.userData) {
            restoreData();
        }

        var setData = function(newPattern) {
            model.userData.searchPattern = newPattern;
            console.log("searchPattern updated:", newPattern);
        }

        $rootScope.$on('SaveStateEvent', saveData);

        return model;
    }])

    .service('chartService', function() {
        var data = {
            numPosts: {
                labels: [],
                series: [[], []],
            },
        };

        return data;
    })
;
