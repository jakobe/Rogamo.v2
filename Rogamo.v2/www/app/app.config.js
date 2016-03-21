(function () {
    'use strict';

    angular.module('app').config(configure);

    function configure($stateProvider, $urlRouterProvider, $httpProvider) {
        $httpProvider.interceptors.push('httpPostInterceptor');

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

        // setup an abstract state for the tabs directive
        .state('tab', {
            url: "/tab",
            abstract: true,
            templateUrl: "app/layout/tabs.html",
            //  https://github.com/driftyco/ng-cordova/issues/8
            //  use the resolve feature of the UI router to wait
            //  for ionic.Platform.ready signal before each state
            //  that might need a plugin
            resolve: {
                ionicReady: ionicReady
            }
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

        .state('tab.eggthrow', {
            url: '/eggthrow',
            views: {
                'tab-dash': {
                    templateUrl: 'app/games/egg-throw.html',
                    controller: 'EggThrowGameController'
                }
            }
        })
        .state('tab.swing', {
            url: '/swing',
            views: {
                'tab-dash': {
                    templateUrl: 'app/games/swing.html',
                    controller: 'SwingGameController'
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

    }

    ionicReady.$inject = ['$q', '$ionicPlatform', '$log'];
    function ionicReady($q, $ionicPlatform, $log) {
        var deferred = $q.defer();
        $ionicPlatform.ready(function () {
            $log.debug('ionic.Platform.ready');
            deferred.resolve();
        });
        return deferred.promise;
    }

})();
