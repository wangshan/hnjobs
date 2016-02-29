'use strict';

var app = angular.module('startupJobsApp');

app.filter('asHtml', ['$sce', function($sce) {
    return function(raw) {
        return $sce.trustAsHtml(raw);
    };
}]);

app.filter('printArray', function() {
    return function(array, separator) {
        if (array && array.length > 0) {
            return array.join(separator);
        }
    }
});

app.filter('printBool', function() {
    return function(bool, textToPrint) {
        if (textToPrint) {
            return bool ? textToPrint : "";
        }
        else {
            return bool ? "yes" : "no";
        }
    }
});

app.filter('regex', function() {
    return function(input, field, regexText) {
        if (!regexText) {
            return input;
        }

        var pattern = new RegExp(regexText, 'ig');
        var output = [];
        for (var i = 0; i < input.length; ++i) {
            if (pattern.test(input[i][field])) {
                //TODO: highlight matched text, replace is really slow
                //var replaced = input[i][field].replace(pattern, '<span class="highlightedText">$&</span>');
                //input[i][field] = replaced;
                output.push(input[i]);
            }
        }
        return output;
    };
});

app.directive('scroller', ['$timeout', 'rememberPositionService',
    function($timeout, rememberPositionService) {
    return {
        restrict: 'EA', // can be used as element or attribute
        scope: {}, // create own isolated scope
        link: function(scope, elem, attrs) {
            // get raw element object to access its scrollTop property
            var raw = elem[0];              

            elem.bind('scroll', function() {
                // remember where we are
                rememberPositionService.scrollTop = raw.scrollTop;
            });

            // Need to wait until the digest cycle is complete to apply this
            // property change to the element.
            $timeout(function() {
                raw.scrollTop = rememberPositionService.scrollTop;
            });
        }
    };
}]);

app.directive('back', ['$window', function($window) {
    return {
        restrict: 'EA', // can be used as element or attribute
        link: function(scope, elem, attrs) {
            elem.bind('click', function() {
                $window.history.back();
            });
        }
    };
}]);

app.controller('HnJobsController',
    ['$scope', 'hnJobsFactory', 'dateLabelsFactory', 'cacheStateService',
    function($scope, hnJobsFactory, dateLabelsFactory, cacheStateService) {
    
    // how to share these two functions between front and back end?

    $scope.getMonthYearText = function(date) {
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
    }

    $scope.showHnJobs = false;
    $scope.message = "Loading ...";
    $scope.search = {};

    if (!angular.isUndefined(cacheStateService.userData.searchPattern)) {
        $scope.search.searchPattern = cacheStateService.userData.searchPattern;
        console.log("restore searchPattern, ", $scope.search.searchPattern);
    }

    $scope.updateSearchPattern = function() {
        cacheStateService.setData($scope.search.searchPattern);
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
        function(response) { // the response is the actual data
            $scope.jobs = response;
            $scope.showHnJobs = true;
        },
        function(response) { // but here is the response object, why?
            $scope.message = "Failed to get jobs\n"
                + "Error: " + response.status + " " + response.statusText;
        }
        );

    $scope.candidates = hnJobsFactory.getHnCandidates().query(
        function(response) { // the response is the actual data
            $scope.candidates = response;
        },
        function(response) { // but here is the response object, why?
            $scope.message = "Failed to get candidates\n"
                + "Error: " + response.status + " " + response.statusText;
        }
        );

    /* TODO: make this a directive?
    $(".dropdown-menu li a").click(function () {
        var selText = $(this).text();
        $(this)
            .closest('div')
            .find('button[data-toggle="dropdown"]')
            .html(selText + ' <span class="caret"></span>');
        $(this).closest('.dropdown').removeClass("open");
        return false;
    });
    */

    $scope.filtMonth = cacheStateService.userData.filtMonth;
    console.log("initially, filtMonth=", $scope.filtMonth);

    $scope.getFiltMonth = function() {
        if (angular.isUndefined(cacheStateService.userData.filtMonth)) {
            // wait for dateLabels to be populated
            $scope.$watch(
                function() {
                    return $scope.dateLabels; },
                function() {
                    cacheStateService.userData.filtMonth = $scope.dateLabels[0];
                    console.log("watch", $scope.dateLabels[0]); }
                    );
        }
        $scope.filtMonth = cacheStateService.userData.filtMonth;
        console.info("getFiltMonth", $scope.filtMonth);

        if ($scope.filtMonth === null) {
            return "All";
        }
        else {
            return $scope.getMonthYearText($scope.filtMonth);
        }
    }

    $scope.selectMonth = function(setMonth) {
        if (setMonth === 0) {
            cacheStateService.userData.filtMonth = null;
        }
        else {
            cacheStateService.userData.filtMonth = $scope.dateLabels[setMonth-1];
        }
        $scope.filtMonth = cacheStateService.userData.filtMonth;
    };

    $scope.filterByMonth = function(job) {
        return $scope.filtMonth === null
            || $scope.getMonthYearText($scope.filtMonth) === job.monthPosted;
    }

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

    // TODO: save this in a service so the controller don't have to query the 
    // api again
    $scope.share = {
        postId: "",
        content: "",
        email: "",
        subject: "",
    };

    $scope.sharePost = function(post) {
        $scope.share.postId = post.id;
        $scope.share.content = post.description;
        console.log("to share: ", post.id);
    };

}])

.controller('AnalyticsController',
    ['$scope', '$q', 'dateLabelsFactory', 'hnJobsFactory', 'chartService',
    function($scope, $q, dateLabelsFactory, hnJobsFactory, chartService) {

    var promises = [];

    $scope.dateLabels = dateLabelsFactory.getDateLabels().query(
        function(response) {
            $scope.dateLabels = response;
            console.log("dateLabels.length=", $scope.dateLabels.length);

            $scope.dateLabels.reverse().forEach(function(item) {
                var monthStr = $scope.getMonthYearText(item);
                console.log(monthStr);
                chartService.numPosts.labels.push(monthStr);

                [{ api: hnJobsFactory.getHnJobsByMonth, index: 0 },
                 { api: hnJobsFactory.getHnCandidatesByMonth, index: 1 }
                ].forEach(function(call) {
                    promises.push(
                        call.api().query({month: monthStr})
                        .$promise
                        .then(
                            function(response) {
                                var num = response.length;
                                console.log(num);
                                console.log(call.index);
                                chartService.numPosts.series[call.index].push(num);
                            },
                            function(response) {
                                chartService.numPosts.series[call.index].push(0);
                            })
                        );
                });
            });
            
            $q.all(promises).then(function() {
                console.log("all promises ready");
                console.log(chartService.numPosts.series);
                $scope.charts = new Chartist.Bar('#chartNumPosts', chartService.numPosts);
            });
        },
        function(response) {
            $scope.message = "Failed to get date labels\n"
                + "Error: " + response.status + " " + response.statusText;
        }
    );
    
    $scope.getMonthYearText = function(date) {
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
    }
    
}])

.controller('JobDetailsController',
    ['$scope', '$stateParams', '$location', 'hnJobsFactory', 'cacheStateService',
    function($scope, $stateParams, $location, hnJobsFactory, cacheStateService) {

    $scope.share = {
        postId: "",
        email: "",
        content: "",
        subject: "",
    };

    $scope.isJob = cacheStateService.userData.showJob;
    var futurePost = $scope.isJob
        ? hnJobsFactory.getHnJobs().get({id: parseInt($stateParams.id, 10)})
        : hnJobsFactory.getHnCandidates().get({id: parseInt($stateParams.id, 10)});

    console.log("$scope.isJob=", $scope.isJob);

    futurePost.$promise.then(
        function(response) { // the response is the actual data
            $scope.share.content = response.description;
        },
        function(response) { // but here is the response object, why?
            $scope.message = "Failed to get jobs\n"
                + "Error: " + response.status + " " + response.statusText;
        }
    );

    $scope.sendEmail = function() {
        //console.log($scope.share.content);
        var link = "mailto:"+ $scope.share.email
             + "?subject= " + escape($scope.share.subject)
             + "&body=" + encodeURIComponent($location.absUrl());
             // NOTE: can't send html in mailto body, so this won't work!
             //+ "&body=" + encodeURIComponent($filter('asHtml')($scope.share.content));

        window.location.href = link;
    };
}])

;
