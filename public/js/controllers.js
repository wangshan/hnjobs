'use strict';

var app = angular.module('startupJobsApp');

app.filter('asHtml', ['$sce', function($sce) {
    return function(raw) {
        return $sce.trustAsHtml(raw);
    };
}]);

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
    ['$scope', '$location', 'hnJobsFactory', 'dateLabelsFactory', function($scope, $location, hnJobsFactory, dateLabelsFactory) {
    
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

    $scope.tab = 1;
    $scope.showHnJobs = false;
    $scope.message = "Loading ...";

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

    $scope.filterByMonth = function(job) {
        return $scope.filtMonth == null
            || $scope.getMonthYearText($scope.filtMonth) == job.monthPosted;
    }

    $scope.select = function(setTab) {
        $scope.tab = setTab;
        if (setTab == 1) {
            $scope.filtMonth = null;
        }
        else {
            $scope.filtMonth = $scope.dateLabels[setTab-2];
        }
    };

    $scope.isSelected = function(checkTab) {
        return ($scope.tab === checkTab);
    };

    $scope.share = {
        id: "",
        jobContent: "",
        email: "",
        subject: "",
    };

    $scope.shareJob = function(job) {
        console.log(job.id);
        $scope.share.jobId = job.id;
        $scope.share.jobContent = job.description;
        $scope.sendEmail();
    };

    $scope.sendEmail = function() {
        console.log($scope.share.jobContent);
        var link = "mailto:"+ $scope.share.email
             + "?subject= " + escape($scope.share.subject)
             + "&body=" + encodeURIComponent($location.absUrl() + $scope.share.jobId);
             // FIXME: client can't click to get this DOM, at least I don't know how
             // maybe it's better to save each job in its own template and serve the page when clients want
             //
             // or save the template in a modal, in this case addthis_share_button makes sense
             // but what would client see then they click via email or other shared link? would the modal pop up automatically?
             //
             // FIXME: can't send html in mailto body, so this won't work!
             //+ "&body=" + encodeURIComponent($filter('asHtml')($scope.share.jobContent));

        window.location.href = link;
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

.controller('AboutController', ['$scope', '$stateParams', function($scope, $stateParams) {
    
}])

;
