(function () {
    'use strict';

    angular.module('app')
    .controller('DashboardController', DashboardController);
    function DashboardController($scope, $ionicPlatform, CanvasRendererService) {

        var fakeRobot = function () {
            this.DRDriveDirection = {
                Stop: 0,
                Forward: 1,
                Backward: -1
            }

            this.kickstandsCommands = {
                up: 'retractKickstands',
                down: 'deployKickstands'
            };

            this.pole = function (command, success, fail) {
                console.log("FakeRobot.pole: " + command);
            }
            this.kickstand = function (command, success, fail) {
                console.log("FakeRobot.kickstand: " + command);
            }
            this.drive = function (command, success, fail) {
                console.log("FakeRobot.drive: " + command);
            }
            this.variableDrive = function (command, driveDirection, turn, success, fail) {
                console.log("FakeRobot.variableDrive | driveDirection:" + driveDirection);
                success({ serial: "00-00FAKE", message: "Fake Robot..." });
            }
            this.turnByDegrees = function (degrees, success, fail) {
                console.log("FakeRobot.turnByDegrees: " + degrees);
            }
        };

        var robot = new fakeRobot();
        $ionicPlatform.ready(function () {
            if (window.device && window.device.platform === 'iOS' && window.cordova && window.cordova.plugins.doubleRobotics) {
                robot = window.cordova.plugins.doubleRobotics;
            }
        });

        $scope.doubleRobotics = {
            serial: "00-000000",
            message: "-"
        }

        $scope.acceleration = {
            x: 0,
            y: 0,
            z: 0,
            direction: 'stop'
        };

        var model = {
            gameStarted: false,
            robotDriving: false,
            speed: 0.5,
            degrees: 0,
            range: 3
        };

        $scope.model = model;

        var games = {
            eggThrow: "eggThrow"
        };

        $scope.games = games;

        $scope.startGame = function (game) {
            if (game === games.eggThrow) {
                console.log('starting game "eggThrow...');
                model.gameStarted = true;
                var gameInstance = new eggThrowGame();
                $scope.stopGame = gameInstance.stop;
                gameInstance.play();
            }
        }

        var eggThrowGame = function () {
            var driveCounter = 0,
                driveIntervalId,
                canvas = document.getElementById('canvas');

            var play = function () {
                clearCanvas(canvas);
                setTimeout(function () { CanvasRendererService.drawSmiley(canvas, 'white') }, 1500);
                robot.kickstand(robot.kickstandsCommands.up);
                setTimeout(function () {
                    robotDrive(parseFloat(model.speed), parseFloat(model.range));
                }, 3000);
            };

            var stop = function () {
                clearInterval(driveIntervalId);
                model.gameStarted = false;
                model.robotDriving = false;
                setTimeout(function () { robot.kickstand(robot.kickstandsCommands.down); }, 3000);
            };

            var onWatchAccelerationSuccess = function (acceleration) {
                $scope.$apply(function () {
                    $scope.acceleration.x = acceleration.x;
                    $scope.acceleration.y = acceleration.y;
                    $scope.acceleration.z = acceleration.z;
                    if (acceleration.z > 2) {
                        $scope.acceleration.direction = 'forward';
                        clearInterval(driveIntervalId);
                        //if (model.robotDriving) {
                        model.robotDriving = false;
                        robot.turnByDegrees(180);
                        setTimeout(function () {
                            robotDrive(parseFloat(model.speed), parseFloat(model.range));
                        }, 2000);
                        //}
                    } else if (acceleration.z < -2) {
                        $scope.acceleration.direction = 'back';
                        clearInterval(driveIntervalId);
                        //if (model.robotDriving) {
                        model.robotDriving = false;
                        robot.turnByDegrees(180);
                        setTimeout(function () {
                            robotDrive(parseFloat(model.speed), parseFloat(model.range));
                        }, 2000);
                        //}
                    } else {
                        $scope.acceleration.direction = 'stop';
                    }
                });
            };

            var onWatchAccelerationError = function () {
                alert('Error getting accelerometer data!');
            };

            if (navigator.accelerometer) {
                var watchOptions = { frequency: 100 };
                var watchID = navigator.accelerometer.watchAcceleration(onWatchAccelerationSuccess, onWatchAccelerationError, watchOptions);
            }

            var robotDrive = function (speed, range) {
                driveCounter = 0;
                model.robotDriving = true;
                var driveSpeed = speed * 0.25;
                var turn = 0.0;
                driveIntervalId = setInterval(function () {
                    if (driveCounter === 10) {
                        driveSpeed = speed * 0.5;
                    }
                    if (driveCounter === 20) {
                        driveSpeed = speed;
                    }
                    if (driveCounter === 40) {
                        driveSpeed = speed * 0.5;
                    }
                    if (driveCounter === 50) {
                        driveSpeed = speed * 0.25;
                    }
                    if (driveCounter >= 60) {
                        clearInterval(driveIntervalId);
                    } else {
                        robot.variableDrive('drive', driveSpeed, turn,
                            function (data) {
                                $scope.$apply(function () {
                                    $scope.doubleRobotics = data;
                                });
                            },
                            function (msg) { alert("Error! => " + msg); });
                    }
                    driveCounter++;
                }, 100);
            };

            this.play = play;
            this.stop = stop;
        };

        //setTimeout(function () { CanvasRendererService.drawSmiley(document.getElementById('canvas')) }, 3000);

    };


})();
