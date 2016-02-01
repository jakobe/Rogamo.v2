(function () {
    'use strict';

    angular.module('app')
    .controller('RobotControlsController', RobotControlsController);

    function RobotControlsController($scope, $ionicPlatform, formatFilter) {
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

        $scope.doubleRobotics = {
            serial: "00-000000",
            message: ""
        }

        $scope.model = {
            degrees: null,
            speed: 0.5
        }

        $scope.kickstandsCommands = {
            up: 'retractKickstands',
            down: 'deployKickstands'
        };

        $scope.poleCommands = {
            up: 'poleUp',
            down: 'poleDown',
            stop: 'poleStop'
        };

        $scope.kickstands = function (direction) {
            robot.kickstand(direction);
        }

        $scope.pole = function (direction) {
            robot.pole(direction);
        }

        $scope.turnByDegrees = function (degrees) {
            robot.turnByDegrees(degrees)//, function (data) { alert("Succes! => " + data.message); }, function (data) { alert("Error! => " + data.message); });
        }

        $scope.drive = function (direction, turn) {
            robot.variableDrive('drive', direction, turn,
                function (data) {
                    $scope.doubleRobotics = data;
                },
                function (msg) { alert("Error! => " + msg); }
            );
        };
    };

})();
