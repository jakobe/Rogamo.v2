(function () {
    'use strict';

    angular.module('app.core')
    .service('FakeRobot', FakeRobot)

    function FakeRobot() {
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
        this.startTravelData = function (success, fail) {
            console.log("FakeRobot.startTravelData");
        }
        this.stopTravelData = function (success, fail) {
            console.log("FakeRobot.stopTravelData");
        }
        this.drive = function (command, success, fail) {
            console.log("FakeRobot.drive: " + command);
        }
        this.variableDrive = function (command, driveDirection, turn, success, fail) {
            console.log("FakeRobot.variableDrive | driveDirection:" + driveDirection);// + " (" + new Date().toISOString() + ")");
            if (typeof success === "function") {
                setTimeout(function () {
                    success({ serial: "00-00FAKE", message: "Fake Robot..." });
                }, 0);
            }
        }
        this.turnByDegrees = function (degrees, success, fail) {
            console.log("FakeRobot.turnByDegrees: " + degrees);
        }
    }

})();