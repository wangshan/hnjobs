'use strict';

var app = angular.module('confusionApp');

app.filter('asHtml', ['$sce', function($sce) {
    return function(raw) {
        return $sce.trustAsHtml(raw);
    };
}]);

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

    $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
    };
}])

.controller('ContactController', ['$scope', function($scope) {

    $scope.feedback = { mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
    
    var channels = [{value:"tel", label:"Tel."}, {value:"Email",label:"Email"}];
    
    $scope.channels = channels;
    $scope.invalidChannelSelection = false;
                
}])

.controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope, feedbackFactory) {
    
    $scope.sendFeedback = function() {
        
        console.log($scope.feedback);
        
        if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
            $scope.invalidChannelSelection = true;
            console.log('incorrect');
        }
        else {
            $scope.invalidChannelSelection = false;
            feedbackFactory.getFeedback().save($scope.feedback);
            $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
            $scope.feedback.mychannel="";
            $scope.feedbackForm.$setPristine();
            console.log($scope.feedback);
        }
    };
}])

.controller('DishCommentController', ['$scope', 'hnJobsFactory', function($scope, hnJobsFactory) {
    
    //Step 1: Create a JavaScript object to hold the comment from the form
    $scope.newComment = {
        rating: 5,
        comment: "",
        author: "",
        date: ""
    };
    
    $scope.submitComment = function () {
        
        //Step 2: This is how you record the date
        $scope.newComment.date = new Date().toISOString();

        console.log($scope.newComment);
        
        // Step 3: Push your comment into the dish's comment array
        $scope.dish.comments.push($scope.newComment);
        hnJobsFactory.getHnJobs().update({id: $scope.dish.id}, $scope.dish);
        
        //Step 4: reset your form to pristine
        $scope.commentForm.$setPristine();
        
        //Step 5: reset your JavaScript object that holds your comment
        $scope.newComment = {
            rating: 5,
            comment: "",
            author: "",
            date: ""
        };
    }
}])

.controller('AboutController', ['$scope', '$stateParams', 'corporateFactory', function($scope, $stateParams, corporateFactory) {

    $scope.showLeaders = false;
    $scope.showLeader = false;
    $scope.message = "Loading ...";

    $scope.leaders = corporateFactory.getLeaders().query(
        function(response) { // the response is the actual data
            $scope.leaders = response;
            $scope.showLeaders = true;
        },
        function(response) { // but here is the response object, why?
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );

    $scope.leader = corporateFactory.getLeaders().get({id: parseInt($stateParams.id, 10)})
    .$promise.then(
        function(response) {
            $scope.leader = response;
            $scope.showLeader = true;
        },
        function(response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );
    
}])

;
