(function () {
    'use strict';

    angular.module('app')
    .controller('RobotControlsController', RobotControlsController);

    function RobotControlsController($scope, robot) {

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
