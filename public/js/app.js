'use strict';

var app = angular.module('startupJobsApp', ['ui.router', 'ngResource'])

// add this to avoid # in the url, also need to add <base href='/'> in html
//    app.config(["$locationProvider", function($locationProvider) {
//      $locationProvider.html5Mode(true);
//    }]);

    app.config(function($stateProvider, $urlRouterProvider) {
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
        .state('app.aboutus', {
            url: 'aboutus',
            views: {
                'content@': {
                    templateUrl: 'static/templates/aboutus.html',
                }
            }
        })
        .state('app.contactus', {
            url:'contactus',
            views: {
                'content@': {
                    templateUrl : 'static/templates/contactus.html',
                    controller  : 'ContactController'
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
        })
        .state('app.analytics', {
            url: 'analytics',
            views: {
                'content@': {
                    templateUrl : 'static/templates/analytics.html',
                    controller  : 'AnalyticsController'
               }
            }
        });

        $urlRouterProvider.otherwise('/');
    })
;
