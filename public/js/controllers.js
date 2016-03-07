'use strict';

var app = angular.module('hnJobsApp');

app.controller('HnJobsController',
    ['$scope',
    '$q',
    'hnJobsFactory',
    'dateLabelsFactory',
    'cacheStateService',
    'dateMonthService',
    'persistStateService',
    'sharePostService',
    function($scope,
        $q,
        hnJobsFactory,
        dateLabelsFactory,
        cacheStateService,
        dateMonthService,
        persistStateService,
        sharePostService) {
    
    $scope.setFiltMonth = function() {
        $scope.filtMonth = cacheStateService.userData.filtMonth;
        $scope.filtMonthLabel = $scope.getFiltMonthLabel($scope.filtMonth);
    };

    $scope.selectMonth = function(setMonth) {
        if (setMonth === 0) {
            cacheStateService.userData.filtMonth = null;
        }
        else {
            cacheStateService.userData.filtMonth = $scope.dateLabels[setMonth-1];
        }
        $scope.setFiltMonth();
        $scope.getAllJobs();
    };

    // NOTE: this depends on both dateLabels and jobs
    $scope.noDataForThisMonth = function(monthIndex) {
        var monthStr = $scope.getMonthYearText($scope.dateLabels[monthIndex]);
        return $scope.jobs[monthStr].length === 0
            && $scope.candidates[monthStr].length === 0;
    };

    $scope.getFiltMonthLabel = function(date) {
        if (date === null) {
            return "All";
        }
        else {
            return $scope.getMonthYearText(date);
        }
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
    };

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

    $scope.updateSearchPattern = function() {
        cacheStateService.setPattern($scope.search.searchPattern);
    }

    $scope.loadMore = function() {
        $scope.totalDisplayed += 20;
        cacheStateService.userData.totalDisplayed = $scope.totalDisplayed;
    }

    //
    // actually controller logic
    //
    $scope.showPosts = false;
    $scope.message = "Loading ...";
    $scope.search = {};
    $scope.getMonthYearText = dateMonthService.getMonthYearText;

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

    if (!angular.isUndefined(cacheStateService.userData.searchPattern)) {
        $scope.search.searchPattern = cacheStateService.userData.searchPattern;
        console.log("restore searchPattern, ", $scope.search.searchPattern);
    }

    if (angular.isUndefined(cacheStateService.userData.filtType)) {
        cacheStateService.userData.filtType = $scope.sourceTypes[0];
    }
    $scope.filtType = cacheStateService.userData.filtType;
    console.log("initially, filtType=", $scope.filtType);

    $scope.jobs = {};
    $scope.candidates = {};
    $scope.disableMonth = [];

    $scope.getAllJobs = function() {
        // build "All" on demand
        if ($scope.filtMonth === null) {
            var totalJobs = [];
            var totalCandidates = [];
            for (var i = 0; i < $scope.dateLabels.length; ++i) {
                totalJobs = totalJobs.concat(
                    $scope.jobs[$scope.getFiltMonthLabel($scope.dateLabels[i])]
                    );
                totalCandidates = totalCandidates.concat(
                    $scope.candidates[$scope.getFiltMonthLabel($scope.dateLabels[i])]
                    );
            }
            console.log("tatalJobs=", totalJobs.length);
            console.log("tatalCandidates=", totalCandidates.length);
            $scope.jobs[$scope.getFiltMonthLabel($scope.filtMonth)] = totalJobs;
            $scope.candidates[$scope.getFiltMonthLabel($scope.filtMonth)] = totalCandidates;

            $scope.showPosts = true;
        }
    };

    $scope.dateLabels = dateLabelsFactory.getDateLabels().query(
        function(response) { // the response is the actual data
            $scope.dateLabels = response;

            var promises = [];

            [
             { api: hnJobsFactory.getHnJobsByMonth, container: $scope.jobs },
             { api: hnJobsFactory.getHnCandidatesByMonth, container: $scope.candidates }
            ].forEach(function(call) {

                $scope.dateLabels.forEach(function(item) {
                    var monthStr = dateMonthService.getMonthYearText(item);

                    promises.push(
                    call.api().query({month: monthStr})
                    .$promise
                    .then(
                        function(response) {
                            console.log("get response for", monthStr);
                            call.container[monthStr] = response;

                            // initialize filtMonth to latest month
                            if (angular.isUndefined(cacheStateService.userData.filtMonth)
                                && item.getTime() === $scope.dateLabels[0].getTime()) {

                                cacheStateService.userData.filtMonth = item;
                                console.log("cached filtMonth:", cacheStateService.userData.filtMonth);
                            }

                            $scope.setFiltMonth();

                            // show data as soon as the chosen month is ready
                            if ($scope.filtMonth === null 
                                || item.getTime() === $scope.filtMonth.getTime()) {
                                $scope.showPosts = true;
                            }
                        },
                        function(response) {
                            $scope.message = "Failed to get posts for " + monthStr + "\n"
                                + "Error: " + response.status + " " + response.statusText;
                        })
                    );
                });
            });

            $q.all(promises).then(function() {

                // Optimization, call noDataForThisMonth in controller to prevent
                // it from being called many times in the digest cycle
                //
                // Also make sure when a new month with no data is added but an
                // older month has been saved as filtMonth, the new month is
                // disabled
                //
                // TODO: if we handle empty month in server side, these logic
                // become unnecessary
                for (var i = 0; i < $scope.dateLabels.length; ++i) {
                    $scope.disableMonth[i] = $scope.noDataForThisMonth(i);
                    if ($scope.disableMonth[i]
                        && $scope.filtMonth.getTime() === $scope.dateLabels[i].getTime()
                        && i + 1 < $scope.dateLabels.length) {
                        cacheStateService.userData.filtMonth = $scope.dateLabels[i+1];
                        console.log("update cached filtMonth:", cacheStateService.userData.filtMonth);

                        $scope.setFiltMonth();
                    }
                }

                $scope.getAllJobs();

            });

        },
        function(response) { // but here is the response object
            $scope.message = "Failed to get date labels\n"
                + "Error: " + response.status + " " + response.statusText;
        }
    );

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
