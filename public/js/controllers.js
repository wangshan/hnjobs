'use strict';

var app = angular.module('hnJobsApp');

app.controller('HnJobsController',
    ['$scope',
    '$timeout',
    'hnJobsFactory',
    'dateLabelsFactory',
    'cacheStateService',
    'dateMonthService',
    'persistStateService',
    'sharePostService',
    function($scope,
        $timeout,
        hnJobsFactory,
        dateLabelsFactory,
        cacheStateService,
        dateMonthService,
        persistStateService,
        sharePostService) {
    
    $scope.showHnJobs = false;
    $scope.message = "Loading ...";
    $scope.search = {};
    $scope.getMonthYearText = dateMonthService.getMonthYearText;

    if (!angular.isUndefined(cacheStateService.userData.searchPattern)) {
        $scope.search.searchPattern = cacheStateService.userData.searchPattern;
        console.log("restore searchPattern, ", $scope.search.searchPattern);
    }

    $scope.updateSearchPattern = function() {
        cacheStateService.setPattern($scope.search.searchPattern);
    }

    // must match source field in the models
    $scope.sourceTypes = [
        "Who Is Hiring",
        "Seeking Freelancer",
        "Who Wants To Be Hired",
        "Seeking Freelance Work",
        ];

    // true shows job post, otherwise show candidate post
    $scope.showJob = cacheStateService.userData.showJob;
    // TODO: totalDisplayed need to be an array, one per sourceTypes
    $scope.totalDisplayed = cacheStateService.userData.totalDisplayed;

    $scope.loadMore = function() {
        $scope.totalDisplayed += 20;
        cacheStateService.userData.totalDisplayed = $scope.totalDisplayed;
    }


    if (angular.isUndefined(cacheStateService.userData.filtType)) {
        cacheStateService.userData.filtType = $scope.sourceTypes[0];
    }
    $scope.filtType = cacheStateService.userData.filtType;
    console.log("initially, filtType=", $scope.filtType);

    $scope.dateLabels = dateLabelsFactory.getDateLabels().query(
        function(response) { // the response is the actual data
            $scope.dateLabels = response;
        },
        function(response) { // but here is the response object
            $scope.message = "Failed to get date labels\n"
                + "Error: " + response.status + " " + response.statusText;
        }
        );

    $scope.jobs = hnJobsFactory.getHnJobs().query(
        function(response) {
            $scope.jobs = response;
            $scope.showHnJobs = true;
        },
        function(response) {
            $scope.message = "Failed to get jobs\n"
                + "Error: " + response.status + " " + response.statusText;
        }
        );

    $scope.candidates = hnJobsFactory.getHnCandidates().query(
        function(response) {
            $scope.candidates = response;
        },
        function(response) {
            $scope.message = "Failed to get candidates\n"
                + "Error: " + response.status + " " + response.statusText;
        }
        );

    $scope.filterByMonth2 = function(job) {
        return this.monthStr === job.monthPosted;
    };

    // FIXME: this depends on both dateLabels and jobs
    $scope.noDataForThisMonth = function(monthIndex) {
        var closure = {
            monthStr: $scope.getMonthYearText($scope.dateLabels[monthIndex])
        };
        var filterThisMonth = $scope.filterByMonth2.bind(closure);
        return $scope.jobs.findIndex(filterThisMonth) === -1;
    };

    $scope.getFiltMonthLabel = function(date) {
        if (date === null) {
            return "All";
        }
        else {
            return $scope.getMonthYearText(date);
        }
    }

    if (angular.isUndefined(cacheStateService.userData.filtMonth)) {
        // wait for dateLabels to be populated
        $scope.$watch(
            function() {
                return $scope.dateLabels; },
            function() {
                cacheStateService.userData.filtMonth = $scope.dateLabels[0];
                console.log("cached filtMonth:", cacheStateService.userData.filtMonth);
                // TODO: this is cheating, fix it properly
                // if the latest month hasn't been populated yet, forcus on
                // the month before
                $timeout(function() {
                    if ($scope.noDataForThisMonth(0) && $scope.dateLabels.length > 1) {
                        console.log("no data for latest month");
                        cacheStateService.userData.filtMonth = $scope.dateLabels[1];
                    }
                }, 1000);
                $scope.filtMonth = cacheStateService.userData.filtMonth;
                $scope.filtMonthLabel = $scope.getFiltMonthLabel($scope.filtMonth);

                // optimization, call noDataForThisMonth in controller to prevent it from
                // being called many times in the digest cycle
                for (var i = 0; i < $scope.dateLabels.length; ++i) {
                    $scope.disableMonth[i] = $scope.noDataForThisMonth(i);
                }
            }
            );
    }
    else {
        $scope.filtMonth = cacheStateService.userData.filtMonth;
        $scope.filtMonthLabel = $scope.getFiltMonthLabel($scope.filtMonth);
        console.log("initially, filtMonth=", $scope.filtMonth);
    }

    $scope.selectMonth = function(setMonth) {
        if (setMonth === 0) {
            cacheStateService.userData.filtMonth = null;
        }
        else {
            cacheStateService.userData.filtMonth = $scope.dateLabels[setMonth-1];
        }
        $scope.filtMonth = cacheStateService.userData.filtMonth;
        $scope.filtMonthLabel = $scope.getFiltMonthLabel($scope.filtMonth);
    };

    $scope.filterByMonth = function(job) {
        return $scope.filtMonth === null
            || $scope.getMonthYearText($scope.filtMonth) === job.monthPosted;
    };

    $scope.selectSourceType = function(setTab) {
        cacheStateService.userData.tab = setTab;
        if (setTab >= $scope.sourceTypes.length) {
            cacheStateService.userData.filtType = null;
        }
        else {
            cacheStateService.userData.filtType = $scope.sourceTypes[setTab];
            // assumes the first two sources are for hiring
            cacheStateService.userData.showJob = (setTab < 2);
        }
        $scope.filtType = cacheStateService.userData.filtType;
        $scope.showJob = cacheStateService.userData.showJob;
    };

    $scope.isSelected = function(checkTab) {
        return (cacheStateService.userData.tab === checkTab);
    };

    $scope.filterBySource = function(job) {
        return $scope.filtType === null
            || $scope.filtType === job.source;
    }

    $scope.sharePost = function(post) {
        sharePostService.postId = post.id;
        sharePostService.content = post.description;
        console.info("to share: ", post.id);
    };

    $scope.setToggleExpand = function(id, expand) {
        persistStateService.toggle[id] = expand;
    };

    $scope.getToggleExpand = function(id) {
        return angular.isUndefined(persistStateService.toggle[id])
            || persistStateService.toggle[id];
    };
}])

.controller('AnalyticsController',
    ['$scope',
    '$q',
    'dateLabelsFactory',
    'hnJobsFactory',
    'chartService',
    'dateMonthService',
    function($scope,
        $q,
        dateLabelsFactory,
        hnJobsFactory,
        chartService,
        dateMonthService) {

    $scope.showCharts = false;
    $scope.message = "Loading ...";

    $scope.dateLabels = dateLabelsFactory.getDateLabels().query(
        function(response) {
            $scope.dateLabels = response;

            var promises = [];

            $scope.dateLabels.reverse().forEach(function(item) {
                var monthStr = dateMonthService.getMonthYearText(item);
                if (chartService.numPosts.labels.indexOf(monthStr) == -1) {
                    chartService.numPosts.labels.push(monthStr);
                }

                [{ api: hnJobsFactory.getHnJobsByMonth, index: 0 },
                 { api: hnJobsFactory.getHnCandidatesByMonth, index: 1 }
                ].forEach(function(call) {
                    promises.push(
                        call.api().query({month: monthStr})
                        .$promise
                        .then(
                            function(response) {
                                var num = response.length;
                                chartService.numPosts.series[call.index][$scope.dateLabels.indexOf(item)] = num;
                            },
                            function(response) {
                                chartService.numPosts.series[call.index][$scope.dateLabels.indexOf(item)] = 0;
                            })
                        );
                });
            });

            $q.all(promises).then(function() {
                $scope.showCharts = true;
                console.log("all promises ready");
                //console.log(chartService.numPosts.series);
                $scope.charts = new Chartist.Bar('#chartNumPosts', chartService.numPosts);
            });
            
        },
        function(response) {
            $scope.message = "Failed to get charts\n"
                + "Error: " + response.status + " " + response.statusText;
        }
    );
    
}])

.controller('JobDetailsController',
    ['$scope',
    '$stateParams',
    '$location',
    'hnJobsFactory',
    'cacheStateService',
    'sharePostService',
    function($scope,
        $stateParams,
        $location,
        hnJobsFactory,
        cacheStateService,
        sharePostService) {

    $scope.share = sharePostService;

    $scope.isJob = cacheStateService.userData.showJob;
    var futurePost = $scope.isJob
        ? hnJobsFactory.getHnJobs().get({id: parseInt($stateParams.id, 10)})
        : hnJobsFactory.getHnCandidates().get({id: parseInt($stateParams.id, 10)});

    console.log("$scope.isJob=", $scope.isJob);

    futurePost.$promise.then(
        function(response) {
            sharePostService.content = response.description;
        },
        function(response) {
            $scope.message = "Failed to get jobs\n"
                + "Error: " + response.status + " " + response.statusText;
        }
    );

    $scope.sendEmail = function() {
        var link = "mailto:"+ sharePostService.email
             + "?subject= " + escape(sharePostService.subject)
             + "&body=" + encodeURIComponent($location.absUrl());
             // NOTE: can't send html in mailto body, so this won't work!
             //+ "&body=" + encodeURIComponent(
             //$filter('asHtml')(sharePostService.content));

        window.location.href = link;
    };
}])

;
