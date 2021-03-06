﻿(function () {
    'use strict';

    angular.module('app.core')
    .factory('$cordovaRobot', CordovaRobot);

    CordovaRobot.$inject = ['$window'];

    function CordovaRobot($window) {
        return ($window.device && ($window.device.platform === 'iOS' || $window.device.platform === 'browser') && $window.cordova && $window.cordova.plugins.doubleRobotics)
            ? $window.cordova.plugins.doubleRobotics
            : null;

        //var d = $q.defer();
        //$ionicPlatform.ready().then(function () {
        //    var robot = ($window.device && $window.device.platform === 'iOS' && $window.cordova && $window.cordova.plugins.doubleRobotics)
        //        ? $window.cordova.plugins.doubleRobotics
        //        : fakeRobot;
        //    d.resolve(robot);
        //});
        //return {
        //    getRobot: function () { return d.promise; }
        //};
    }

})();
