'use strict';

angular.module('hnJobsApp')
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
                    toString.call(data[key]) !== '[object String]') {
                    continue;
                }
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

    .service('sharePostService', function() {
        var model = {
            postId: "",
            email: "",
            content: "xx",
            subject: "",
        };

        return model;
    })

    .service('dateMonthService', function() {
        this.getMonthYearText = function(date) {
            var getMonthName = function(date) {
                var monthNames = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ];
                return monthNames[date.getMonth()];
            }
            return getMonthName(date) + " " + date.getFullYear();
        };
    })

    .service('rememberPositionService', function() {
        return {
            scrollTop: undefined
        };
    })

    .service('persistStateService', ['$window', '$rootScope',
        function($window, $rootScope) {

        var model = {
            toggle: {}
        };

        var saveData = function() {
            $window.localStorage.toggle = angular.toJson(model.toggle);
            console.log("persistStateService, to save data");
        }

        var restoreData = function() {
            var toggle = angular.fromJson($window.localStorage.toggle);
            model.toggle = toggle;
            console.log("persistStateService, to restore data");
        }

        // restore data on initialization
        if ($window.localStorage.toggle) {
            restoreData();
        }

        $rootScope.$on('SaveStateEvent', saveData);
        return model; 
    }])

    .service('cacheStateService', ['$window', '$rootScope',
        function($window, $rootScope) {

        var initialUserData = {
            tab: 0,
            showJob: true, // show jobs or candidates
            filtType: undefined,
            filtMonth: undefined,
            searchPattern: undefined,
            totalDisplayed: 20,
        }

        var setPattern = function(newPattern) {
            model.userData.searchPattern = newPattern;
            console.log("searchPattern updated:", newPattern);
        }

        var model = {
            userData: initialUserData,
            setPattern: setPattern,
        };

        var saveData = function() {
            $window.sessionStorage.userData = angular.toJson(model.userData);
            console.log("cacheStateService, to save data");
        }

        var restoreData = function() {
            var data = angular.fromJson($window.sessionStorage.userData);
            console.log('data.filtMonth', data.filtMonth);
            if (data.filtMonth != null) {
                // convert from string, because there's no date type in JSON
                data.filtMonth = new Date(data.filtMonth);
            }
            model.userData = data;
            console.log("cacheStateService, to restore data");
        }

        // restore data on initialization
        if ($window.sessionStorage.userData) {
            restoreData();
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
