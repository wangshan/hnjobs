'use strict';

var app = angular.module('hnJobsApp');

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
