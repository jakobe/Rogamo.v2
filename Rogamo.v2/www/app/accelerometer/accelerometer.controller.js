(function () {
    'use strict';

    angular.module('app')
    .controller('AccelerometerController', AccelerometerController);

    AccelerometerController.$inject = ['$scope', '$cordovaRobot'];

    function AccelerometerController($scope, robot) {

        $scope.acceleration = {
            x: 0,
            y: 0,
            z: 0,
            direction: 'stop'
        };

        //if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        //    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        //}

        $scope.retractKickstands = robot.retractKickstands;
        $scope.deployKickstands = robot.deployKickstands;

        $scope.turnByDegrees = function (degrees) {
            robot.turnByDegrees(180, function (msg) { alert("Succes! => " + msg); }, function (msg) { alert("Error! => " + msg); });
        };


        $scope.driveForward = function () {
            var counter = 0;
            var driveSpeed = 0.25;
            var turn = 0.0;
            var intervalId = setInterval(function () {
                if (counter === 10) {
                    driveSpeed = 0.5
                    turn = 0.25;
                }
                if (counter === 20) {
                    driveSpeed = 1.0
                }
                if (counter === 40) {
                    driveSpeed = 0.5
                }
                if (counter === 50) {
                    driveSpeed = 0.25
                    turn = 0.0;
                }
                if (counter >= 60) {
                    clearInterval(intervalId);
                } else {
                    robot.drive(driveSpeed, turn, null,
                        function (data) {
                            $scope.doubleRobotics = data;
                        },
                        function (msg) { alert("Error! => " + msg); });
                }
                counter++;
            }, 100);
        };

        $scope.driveBackward = function () {
            var counter = 0;
            var intervalId = setInterval(function () {
                if (counter >= 20) {
                    clearInterval(intervalId);
                } else {
                    robot.drive(-0.5);
                    counter++;
                }
            }, 100);
        };

        function onAccelerometerSuccess(acceleration) {
            $scope.$apply(function () {
                $scope.acceleration.x = acceleration.x;
                $scope.acceleration.y = acceleration.y;
                $scope.acceleration.z = acceleration.z;
                if (acceleration.z > 2) {
                    $scope.acceleration.direction = 'forward';
                } else if (acceleration.z < -2) {
                    $scope.acceleration.direction = 'back';
                } else {
                    $scope.acceleration.direction = 'stop';
                }
            });
        }

        function onAccelerometerError() {
            alert('Error getting accelerometer data!');
        }

        if (navigator.accelerometer) {
            var options = { frequency: 500 };
            var watchID = navigator.accelerometer.watchAcceleration(onAccelerometerSuccess, onAccelerometerError, options);
        }
    };


})();
