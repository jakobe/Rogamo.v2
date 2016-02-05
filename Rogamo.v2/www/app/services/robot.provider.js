(function () {
    'use strict';

    angular.module('app.core')
    .provider('RobotProvider', RobotProvider);

    function RobotProvider() {

        this.$get = ['$window', '$ionicPlatform', 'FakeRobot', function ($window, $ionicPlatform, fakeRobot) {
            //debugger;
            //alert('window.device && window.device.platform === "iOS": ' + (window.device && window.device.platform === 'iOS'));
            //$ionicPlatform.ready(function () {
            //    //alert('$ionicPlatform.ready');
            //    //alert('window.device && window.device.platform === "iOS": ' + (window.device && window.device.platform === 'iOS'));
            //    //if (window.device && window.device.platform === 'iOS' && window.cordova && window.cordova.plugins.doubleRobotics) {
            //    //    robot = window.cordova.plugins.doubleRobotics;
            //    //}
            //});
            if (window.device && window.device.platform === 'iOS' && window.cordova && window.cordova.plugins.doubleRobotics) {
                //setTimeout(function () { alert("return window.cordova.plugins.doubleRobotics;"); }, 5000);
                return window.cordova.plugins.doubleRobotics;
            } else {
                //alert("return fakeRobot");
                //setTimeout(function () { alert("return fakeRobot"); }, 5000);
                return fakeRobot;
            }
            
        }];
    }

})();
