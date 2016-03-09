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
            driveStartDate = new Date();
            leftEncoderDeltaCm = 0.0;
            rightEncoderDeltaCm = 0.0;
        }
        this.stopTravelData = function (success, fail) {
            console.log("FakeRobot.stopTravelData");
        }
        var driveIntervalId,
            leftEncoderDeltaCm,
            rightEncoderDeltaCm,
            driveData = [],
            driveStartDate;
        this.drive = function (driveDirection, turn, rangeInCm, success, fail) {
            if (typeof driveDirection === "string") driveDirection = parseFloat(driveDirection);
            //if (!driveStartDate) {
                driveStartDate = new Date();
                leftEncoderDeltaCm = 0.0;
                rightEncoderDeltaCm = 0.0;
            //}
            //console.log("FakeRobot.drive | driveDirection:" + driveDirection);// + " (" + new Date().toISOString() + ")");
            if (driveIntervalId) {
                clearInterval(driveIntervalId);
            }
            driveIntervalId = setInterval(function () {
                if (rangeInCm && rangeInCm - leftEncoderDeltaCm < 50) {
                    driveDirection *= 0.95;
                }
                leftEncoderDeltaCm += (10.0 * driveDirection);
                rightEncoderDeltaCm += (10.0 * driveDirection);
                var elapsedTimeInMs = new Date() - driveStartDate;
                var newData = {
                    speed: driveDirection,
                    range: Math.abs(leftEncoderDeltaCm),
                    time: new Date(),//msToTime(elapsedTimeInMs),
                    start: driveStartDate
                };
                driveData.push(newData)
                console.log("FakeRobot.drive | driveDirection:" + driveDirection + " | leftEncoderDeltaCm: " + leftEncoderDeltaCm + " | elapsedTimeInMs: " + elapsedTimeInMs);// + " (" + new Date().toISOString() + ")");
                var cmPerInches = 2.54;
                var travelData = {
                    leftEncoderDeltaInches: leftEncoderDeltaCm / cmPerInches,
                    rightEncoderDeltaInches: rightEncoderDeltaCm / cmPerInches,
                    leftEncoderDeltaCm: leftEncoderDeltaCm,
                    rightEncoderDeltaCm: rightEncoderDeltaCm,
                    driveData: driveData,
                    lastDrive: newData
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

        function raiseEvent(eventName, data) {
            if (typeof CustomEvent !== 'undefined') {
                var event = new CustomEvent(eventName, { 'detail': data });
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