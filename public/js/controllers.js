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

app.controller('HnJobsController',
    ['$scope', 'hnJobsFactory', 'dateLabelsFactory', function($scope, hnJobsFactory, dateLabelsFactory) {
    
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

    $scope.tab = 0;
    $scope.showHnJobs = false;
    $scope.message = "Loading ...";
    $scope.search = {};

    // must match source field in the models
    $scope.sourceTypes = [
        "Who Is Hiring",
        "Seeking Freelancer",
        "Who Wants To Be Hired",
        "Seeking Freelance Work",
        ];

    // true shows job post, otherwise show candidate post
    $scope.showJob = true;

    $scope.filtType = $scope.sourceTypes[0];

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
        $(this).closest('div').find('button[data-toggle="dropdown"]').html(selText + ' <span class="caret"></span>');
        $(this).closest('.dropdown').removeClass("open");
        return false;
    });
    */

    $scope.filtMonth = $scope.dateLabels[0];
    console.log("initially", $scope.filtMonth);

    // TODO: this should be removed once dropdown is fixed properly
    $scope.getFiltMonth = function() {
        if ($scope.filtMonth == null) {
            return "All";
        }
        else {
            return $scope.getMonthYearText($scope.filtMonth);
        }
    }

    $scope.selectMonth = function(setMonth) {
        if (setMonth == 0) {
            $scope.filtMonth = null;
        }
        else {
            $scope.filtMonth = $scope.dateLabels[setMonth-1];
        }
    };

    $scope.filterByMonth = function(job) {
        return $scope.filtMonth == null
            || $scope.getMonthYearText($scope.filtMonth) == job.monthPosted;
    }

    $scope.selectSourceType = function(setTab) {
        $scope.tab = setTab;
        if (setTab >= $scope.sourceTypes.length) {
            $scope.filtType = null;
        }
        else {
            $scope.filtType = $scope.sourceTypes[setTab];
            // assumes the first two sources are for hiring
            $scope.showJob = (setTab < 2);
        }
    };

    $scope.isSelected = function(checkTab) {
        return ($scope.tab === checkTab);
    };

    $scope.filterBySource = function(job) {
        return $scope.filtType == null
            || $scope.filtType == job.source;
    }

    $scope.share = {
        jobId: "",
        jobContent: "",
        email: "",
        subject: "",
    };

    $scope.shareJob = function(job) {
        $scope.share.jobId = job.id;
        $scope.share.jobContent = job.description;
        console.log(job.id);
    };

}])

.controller('ContactController', ['$scope', function($scope) {

    $scope.feedback = {
        firstName: "",
        lastName: "",
        agree: false,
        email: "" 
    };
    
    $scope.invalidChannelSelection = false;
                
}])

.controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope, feedbackFactory) {
    
    $scope.sendFeedback = function() {
        
        console.log($scope.feedback);
        
        if ($scope.feedback.agree && ($scope.feedback.email == "")) {
            $scope.invalidChannelSelection = true;
            console.log('incorrect');
        }
        else {
            $scope.invalidChannelSelection = false;
            feedbackFactory.getFeedback().save($scope.feedback);
            $scope.feedback = { firstName: "", lastName: "", agree: false, email: "" };
            $scope.feedback.email = "";
            $scope.feedbackForm.$setPristine();
            console.log($scope.feedback);
        }
    };
}])

.controller('JobDetailsController',
    ['$scope', '$stateParams', '$location', 'hnJobsFactory', function($scope, $stateParams, $location, hnJobsFactory) {

    $scope.showJobDetails = false;
    $scope.share = {
        jobId: "",
        email: "",
        jobContent: "",
        subject: "",
    };

    hnJobsFactory.getHnJobs().get({id: parseInt($stateParams.id, 10)})
    .$promise.then(
        function(response) { // the response is the actual data
            $scope.share.jobContent = response.description;
            $scope.showJobDetails = true;
        },
        function(response) { // but here is the response object, why?
            $scope.message = "Failed to get jobs\n"
                + "Error: " + response.status + " " + response.statusText;
        }
    );

    $scope.sendEmail = function() {
        console.log($scope.share.jobContent);
        var link = "mailto:"+ $scope.share.email
             + "?subject= " + escape($scope.share.subject)
             + "&body=" + encodeURIComponent($location.absUrl());
             // NOTE: can't send html in mailto body, so this won't work!
             //+ "&body=" + encodeURIComponent($filter('asHtml')($scope.share.jobContent));

        window.location.href = link;
    };
}])

.controller('AboutController', ['$scope', '$stateParams', function($scope, $stateParams) {
    
}])

;
