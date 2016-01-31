'use strict';

angular.module('confusionApp', ['ui.router', 'ngResource'])
    .config(function($stateProvider, $urlRouterProvider) {
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
                    controller: 'AboutController'
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
        /*
        .state('app.menu', {
            url: 'menu',
            views: {
                'content@': {
                    templateUrl : 'static/templates/menu.html',
                    controller  : 'HnJobsController'
                }
            }
        })
        .state('app.dishdetails', {
            url: 'menu/:id',
            views: {
                'content@': {
                    templateUrl : 'static/templates/dishdetail.html',
                    controller  : 'DishDetailController'
               }
            }
        });
        */

        $urlRouterProvider.otherwise('/');
    })
;
