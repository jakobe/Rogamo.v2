(function () {
    'use strict';

    angular.module('app').config(configure);

    function configure($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

        // setup an abstract state for the tabs directive
          .state('tab', {
              url: "/tab",
              abstract: true,
              templateUrl: "app/layout/tabs.html"
          })

        // Each tab has its own nav history stack:


        .state('tab.dash', {
            url: '/dash',
            views: {
                'tab-dash': {
                    templateUrl: 'app/dashboard/dashboard.html',
                    controller: 'DashboardController'
                }
            }
        })

         .state('tab.acc', {
             url: '/acc',
             views: {
                 'tab-acc': {
                     templateUrl: 'app/accelerometer/accelerometer.html',
                     controller: 'AccelerometerController'
                 }
             }
         })

        .state('tab.controls', {
            url: '/controls',
            views: {
                'tab-controls': {
                    templateUrl: 'app/robot-controls/robot-controls.html',
                    controller: 'RobotControlsController'
                }
            }
        });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/dash');

    };

})();



