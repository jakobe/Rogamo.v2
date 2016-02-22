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


        this.poleDown = function (success, fail) {
            console.log("FakeRobot.poleDown");
        }
        this.poleStop = function (success, fail) {
            console.log("FakeRobot.poleStop");
        }
        this.poleUp = function (command, success, fail) {
            console.log("FakeRobot.poleUp");
        }

        this.retractKickstands = function (success, fail) {
            console.log("FakeRobot.retractKickstands");
        }
        this.deployKickstands = function (success, fail) {
            console.log("FakeRobot.deployKickstands");
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
        var driveIntervalId,
            leftEncoderDeltaCm,
            rightEncoderDeltaCm,
            driveData = [],
            driveStartDate;
        this.variableDrive2 = function (driveDirection, turn, rangeInCm, success, fail) {
            if (!driveStartDate) {
                driveStartDate = new Date();
                leftEncoderDeltaCm = 0.0;
                rightEncoderDeltaCm = 0.0;
            }
            //console.log("FakeRobot.variableDrive | driveDirection:" + driveDirection);// + " (" + new Date().toISOString() + ")");
            if (driveIntervalId) {
                clearInterval(driveIntervalId);
            }
            driveIntervalId = setInterval(function () {
                leftEncoderDeltaCm += 5.0;
                rightEncoderDeltaCm = 5.0;
                var elapsedTimeInMs = new Date() - driveStartDate;
                driveData.push({
                    speed: driveDirection,
                    range: Math.abs(leftEncoderDeltaCm),
                    time: msToTime(elapsedTimeInMs)
                })
                console.log("FakeRobot.variableDrive | driveDirection:" + driveDirection + " | leftEncoderDeltaCm: " + leftEncoderDeltaCm + " | elapsedTimeInMs: " + elapsedTimeInMs);// + " (" + new Date().toISOString() + ")");
                var cmPerInches = 2.54;
                var travelData = {
                    leftEncoderDeltaInches: leftEncoderDeltaCm / cmPerInches,
                    rightEncoderDeltaInches: rightEncoderDeltaCm / cmPerInches,
                    leftEncoderDeltaCm: leftEncoderDeltaCm,
                    rightEncoderDeltaCm: rightEncoderDeltaCm,
                    driveData: driveData
                };
                raiseEvent('traveldata', travelData)
                if (rangeInCm && leftEncoderDeltaCm >= rangeInCm) {
                    console.log("FakeRobot.stop => rangeInCm >= " + rangeInCm + " | leftEncoderDeltaCm: " + leftEncoderDeltaCm);// + " (" + new Date
                    clearInterval(driveIntervalId);
                }
            }, 200);
            if (typeof success === "function") {
                setTimeout(function () {
                    success({ serial: "00-00FAKE", message: "Fake Robot..." });
                }, 0);
            }
        }
        this.turnByDegrees = function (degrees, success, fail) {
            console.log("FakeRobot.turnByDegrees: " + degrees);
        }
        this.stop = function (success, fail) {
            console.log("FakeRobot.stop()");
            clearInterval(driveIntervalId);
            //driveData.length = 0;
            //driveStartDate = null;
        }

        var customEvents = {};
        function raiseEvent(eventName, data) {
            var event = customEvents[eventName];
            if (!event) {
                if (typeof CustomEvent !== 'undefined') {
                    event = new CustomEvent(eventName, { 'detail': data });
                }
                customEvents[eventName] = event;
            }
            if (event) {
                window.dispatchEvent(event);
            }
        }

        function msToTime(duration) {
            var milliseconds = parseInt((duration % 1000)),
                seconds = parseInt((duration / 1000) % 60),
                minutes = parseInt((duration / (1000 * 60)) % 60),
                hours = parseInt((duration / (1000 * 60 * 60)) % 24);

            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;
            milliseconds = (milliseconds < 100) ? "0" + milliseconds : milliseconds;

            return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
        }



    }

})();