'use strict';

angular.module('confusionApp')

        .controller('MenuController', ['$scope', 'hnJobsFactory', function($scope, hnJobsFactory) {
            
            $scope.tab = 1;
            $scope.filtText = '';
            $scope.showDetails = false;
            $scope.showHnJobs = false;
            $scope.message = "Loading ...";

            $scope.dishes = hnJobsFactory.getHnJobs().query(
                function(response) { // the response is the actual data
                    $scope.hnJobs = response;
                    $scope.showHnJobs = true;
                },
                function(response) { // but here is the response object, why?
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                }
                );
 
            $scope.select = function(setTab) {
                $scope.tab = setTab;
                
                if (setTab === 2) {
                    $scope.filtText = "January 2016";
                }
                else if (setTab === 3) {
                    $scope.filtText = "December 2015";
                }
                else if (setTab === 4) {
                    $scope.filtText = "November 2015";
                }
                else {
                    $scope.filtText = "";
                }
            };

            $scope.isSelected = function (checkTab) {
                return ($scope.tab === checkTab);
            };
    
            $scope.toggleDetails = function() {
                $scope.showDetails = !$scope.showDetails;
            };
        }])

        .controller('ContactController', ['$scope', function($scope) {

            $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
            
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

        .controller('DishDetailController', ['$scope', '$stateParams', 'hnJobsFactory', function($scope, $stateParams, hnJobsFactory) {

            $scope.showDish = false;
            $scope.message = "Loading ...";

            $scope.dish = hnJobsFactory.getHnJobs().get({id:parseInt($stateParams.id, 10)})
            .$promise.then(
                function(response) {
                    $scope.dish = response;
                    $scope.showDish = true;
                },
                function(response) {
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                }
            );

            // using $http
//            $scope.dish = {};
//            hnJobsFactory.getDish(parseInt($stateParams.id, 10))
//            .then(
//                function(response) {
//                    $scope.dish = response.data;
//                    $scope.showDish = true;
//                },
//                function(response) {
//                    $scope.message = "Error: " + response.status + " " + response.statusText;
//                }
//            );
            
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

        .controller('IndexController', ['$scope', 'hnJobsFactory', 'corporateFactory', function($scope, hnJobsFactory, corporateFactory) {

            $scope.showPromotion = false;
            $scope.showDish = false;
            $scope.showChef = false;
            $scope.message = "Loading ...";

            $scope.promotion = hnJobsFactory.getPromotions().get({id:0})
            .$promise.then(
                function(response) {
                    $scope.promotion = response;
                    $scope.showPromotion = true;
                },
                function(response) {
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                }
            );

            $scope.featuredDish = hnJobsFactory.getHnJobs().get({id:0})
            .$promise.then(
                function(response) {
                    $scope.featuredDish = response;
                    $scope.showDish = true;
                },
                function(response) {
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                }
            );

            $scope.chef = corporateFactory.getLeaders().get({id:3})
            .$promise.then(
                function(response) {
                    $scope.chef = response;
                    $scope.showChef = true;
                },
                function(response) {
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                }
            );
            
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
