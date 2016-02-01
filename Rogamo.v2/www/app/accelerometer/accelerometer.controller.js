(function () {
    'use strict';

    angular.module('app')
    .controller('AccelerometerController', AccelerometerController);

    function AccelerometerController($scope, $ionicPlatform) {
        var fakeRobot = function () {
            this.DRDriveDirection = {
                Stop: 0,
                Forward: 1,
                Backward: -1
            }

            this.pole = function (command, success, fail) {
                console.log("FakeRobot.pole");
            }
            this.kickstand = function (command, success, fail) {
                console.log("FakeRobot.kickstand");
            }
            this.drive = function (command, success, fail) {
                console.log("FakeRobot.drive");
            }
            this.variableDrive = function (command, driveDirection, turn, success, fail) {
                console.log("FakeRobot.variableDrive");
                success({ serial: "00-00FAKE", message: "Fake Robot..." });
            }
            this.turnByDegrees = function (degrees, success, fail) {
                console.log("FakeRobot.turnByDegrees");
            }
        };

        var robot = new fakeRobot();
        $ionicPlatform.ready(function () {
            if (window.device && window.device.platform === 'iOS' && window.cordova && window.cordova.plugins.doubleRobotics) {
                robot = window.cordova.plugins.doubleRobotics;
            }
        });


        $scope.acceleration = {
            x: 0,
            y: 0,
            z: 0,
            direction: 'stop'
        };

        //if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        //    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        //}

        $scope.retractKickstands = function () {
            robot.kickstand("retractKickstands");
        }

        $scope.deployKickstands = function () {
            robot.kickstand("deployKickstands");
        }

        $scope.turnByDegrees = function (degrees) {
            robot.drive("turnByDegrees", function (msg) { alert("Succes! => " + msg); }, function (msg) { alert("Error! => " + msg); });
        }


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
                    robot.variableDrive('drive', driveSpeed, turn,
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
                    robot.drive('drive', -0.5);
                    counter++;
                }
            }, 100);
        };

        //alert($ionicPlatform);
        if (navigator.accelerometer) {
            function onSuccess(acceleration) {
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
                //console.log('Acceleration X: ' + acceleration.x + '\n' +
                //      'Acceleration Y: ' + acceleration.y + '\n' +
                //      'Acceleration Z: ' + acceleration.z + '\n' +
                //      'Timestamp: ' + acceleration.timestamp + '\n');
            }

            function onError() {
                alert('Error getting accelerometer data!');
            }

            var options = { frequency: 500 };

            var watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);

        }
    };


})();
