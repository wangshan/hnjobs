'use strict';

// with [ ] this creates a new module
var app = angular.module('hnJobsApp', ['ui.router', 'ngResource', 'app.config']);

// add this to avoid # in the url, also need to add <base href='/'> in html
//    app.config(["$locationProvider", function($locationProvider) {
//      $locationProvider.html5Mode(true);
//    }]);

app.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('app', {
        url: '/',
        views: {
            'header': {
                templateUrl: 'static/templates/header.html',
            },
            'content': {
                templateUrl: 'static/templates/home.html',
                controller: 'HnJobsController'
            },
            'footer': {
                templateUrl: 'static/templates/footer.html',
            }
        }
    })
    .state('app.analytics', {
        url: 'analytics',
        views: {
            'content@': {
                templateUrl : 'static/templates/analytics.html',
                controller  : 'AnalyticsController'
           }
        }
    })
    .state('app.aboutus', {
        url: 'aboutus',
        views: {
            'content@': {
                templateUrl: 'static/templates/aboutus.html',
            }
        }
    })
    .state('app.jobdetails', {
        url: ':id',
        views: {
            'content@': {
                templateUrl : 'static/templates/jobdetails.html',
                controller  : 'JobDetailsController'
           }
        }
    });

    $urlRouterProvider.otherwise('/');
}])

.run(['$window', '$rootScope', function($window, $rootScope) {
    // before leaving this page, signal all event listeners to save their data
    $window.onbeforeunload = function(event) {
        console.log("broadcasting save state event");
        $rootScope.$broadcast('SaveStateEvent');
    };
}])

;
