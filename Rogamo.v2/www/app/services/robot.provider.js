(function () {
    'use strict';

    angular.module('app.core')
    .factory('RobotProvider', ['$window', '$q', '$ionicPlatform', 'FakeRobot', RobotProvider]);

    function RobotProvider($window, $q, $ionicPlatform, fakeRobot) {
        var d = $q.defer();
        $ionicPlatform.ready().then(function () {
            var robot = ($window.device && $window.device.platform === 'iOS' && $window.cordova && $window.cordova.plugins.doubleRobotics)
                ? $window.cordova.plugins.doubleRobotics
                : fakeRobot;
            d.resolve(robot);
        });
        return {
            getRobot: function () { return d.promise; }
        };


        //this.$get = ['$window', '$q', '$ionicPlatform', 'FakeRobot', function ($window, $q, $ionicPlatform, fakeRobot) {
        //    var d = $q.defer();
        //    //debugger;
        //    $ionicPlatform.ready().then(function () {
        //        //var ref = new Firebase(FIREBASE_URL);
        //        //auth = $firebaseAuth(ref);
        //        d.resolve(fakeRobot);
        //    });
        //    return d.promise;
        //    //debugger;
        //    //alert('window.device && window.device.platform === "iOS": ' + (window.device && window.device.platform === 'iOS'));
        //    //$ionicPlatform.ready(function () {
        //    //    //alert('$ionicPlatform.ready');
        //    //    //alert('window.device && window.device.platform === "iOS": ' + (window.device && window.device.platform === 'iOS'));
        //    //    //if (window.device && window.device.platform === 'iOS' && window.cordova && window.cordova.plugins.doubleRobotics) {
        //    //    //    robot = window.cordova.plugins.doubleRobotics;
        //    //    //}
        //    //});


        //    if (window.device && window.device.platform === 'iOS' && window.cordova && window.cordova.plugins.doubleRobotics) {
        //        //setTimeout(function () { alert("return window.cordova.plugins.doubleRobotics;"); }, 5000);
        //        return window.cordova.plugins.doubleRobotics;
        //    } else {
        //        //alert("return fakeRobot");
        //        //setTimeout(function () { alert("return fakeRobot"); }, 5000);
        //        return fakeRobot;
        //    }
            
        //}];
    }

})();
