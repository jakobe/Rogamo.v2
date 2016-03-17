(function () {
    'use strict';

    angular.module('app.core')
    .factory('EggThrowGame', EggThrowGame);

    EggThrowGame.$inject = ['$cordovaRobot', '$ionicPlatform', 'audioService'];

    function EggThrowGame(robot, $ionicPlatform, audioService) {
        var model = null,
            onSuccess,
            onFailure,
            onGameOver,
            onRobotPush,
            driveCounter = 0,
            points = 0,
            totalPointsToWin = 5,
            preventPush = false,
            direction = 1,
            robotDriveTimeoutId,
            accelerometerWatchID,
            soundFiles = [
                { id: 'success', path: 'audio/109663__grunz__success_low.wav' },
                { id: 'gameover', path: 'audio/82248__robinhood76__01299-smashing-egg-1.wav' }
            ];

        preloadSounds();

        var game = {
            init: init,
            play: play,
            stop: stop
        };
        return game;

        function init(modelX, successHandler, failureHandler, gameOverHandler, robotPushHandler) {
            model = modelX;
            onSuccess = successHandler;
            onFailure = failureHandler;
            onGameOver = gameOverHandler;
            onRobotPush = robotPushHandler;
        }

        function play() {
            points = 0;
            $ionicPlatform.ready(function () {
                //alert('watchAcceleration...');
                var watchOptions = { frequency: 100 };
                if (navigator.accelerometer) {
                    accelerometerWatchID = navigator.accelerometer.watchAcceleration(onWatchAccelerationSuccess, onWatchAccelerationError, watchOptions);
                }
            });
            robot.retractKickstands();
            setTimeout(function () {
                model.gameStarted = true;
                robotStartDrive(parseFloat(model.speed), parseFloat(model.range) * 100);
            }, 3000);
        };

        function stop() {
            robotStopDrive();
            model.gameStarted = false;
            stopAccelerometer();
            //setTimeout(function () { robot.deployKickstands(); }, 500);
        };

        function stopAccelerometer() {
            if (navigator.accelerometer && accelerometerWatchID) {
                navigator.accelerometer.clearWatch(accelerometerWatchID);
                accelerometerWatchID = null;
            }
        }

        function onWatchAccelerationSuccess(acceleration) {
            if (model.gameStarted && !preventPush && model && model.minAcceleration && model.maxAcceleration) {
                if (acceleration.z > parseFloat(model.maxAcceleration) || acceleration.z < -(parseFloat(model.maxAcceleration))) {
                    robotStopDrive();
                    stopAccelerometer();
                    if (typeof onRobotPush === "function") {
                        //setTimeout(function () {
                            onRobotPush({ acceleration: acceleration });
                        //}, 0);
                    }
                    audioService.play('gameover');
                    if (typeof onGameOver === "function") {
                        setTimeout(function () {
                            onGameOver(false, {});
                        }, 0);
                    }
                } else if (acceleration.z > parseFloat(model.minAcceleration) || acceleration.z < -(parseFloat(model.minAcceleration))) {
                    //alert('onRobotPush: ' + onRobotPush);
                    //alert('typeof onRobotPush: ' + (typeof onRobotPush) + '(typeof onRobotPush === "function"): ' + (typeof onRobotPush === 'function'));
                    //alert('acceleration.z: ' + acceleration.z + ' | model.minAcceleration: ' + model.minAcceleration + ' | model.maxAcceleration: ' + model.maxAcceleration);
                    points++;
                    robotStopDrive();
                    preventPush = true;
                    audioService.play('success');
                    if (typeof onRobotPush === "function") {
                        //setTimeout(function () {
                        onRobotPush({ acceleration: acceleration });
                        //}, 0);
                    }

                    var gameContainer = document.getElementById('gameContainer');
                    gameContainer.setAttribute("data-background-color-init", gameContainer.style.backgroundColor);
                    gameContainer.style.backgroundColor = "green";
                    if (points >= totalPointsToWin) {
                        //Game won!
                        //stop();
                        stopAccelerometer();
                        if (typeof onGameOver === "function") {
                            setTimeout(function () {
                                onGameOver(true, {});
                            }, 0);
                        }
                    } else {
                        setTimeout(function () {
                            preventPush = false;
                            gameContainer.style.backgroundColor = gameContainer.getAttribute("data-background-color-init");
                        }, 1000);
                        direction = -direction;

                        if (parseFloat(model.degrees) != 0) {
                            robot.turnByDegrees(parseFloat(model.degrees));
                        }
                        setTimeout(function () {
                            robotStartDrive(parseFloat(model.speed) * direction, parseFloat(model.range) * 100);
                        }, 500);
                    }
                }
            }
            //$scope.$apply(function () {
            //    $scope.acceleration.x = acceleration.x;
            //    $scope.acceleration.y = acceleration.y;
            //    $scope.acceleration.z = acceleration.z;
            //    if (acceleration.z > 2) {
            //        $scope.acceleration.direction = 'forward';
            //        //if (model.robotDriving) {
            //        model.robotDriving = false;
            //        robot.turnByDegrees(180);
            //        setTimeout(function () {
            //            robotStartDrive(parseFloat(model.speed), parseFloat(model.range));
            //        }, 2000);
            //        //}
            //    } else if (acceleration.z < -2) {
            //        $scope.acceleration.direction = 'back';
            //        //if (model.robotDriving) {
            //        model.robotDriving = false;
            //        robot.turnByDegrees(180);
            //        setTimeout(function () {
            //            robotStartDrive(parseFloat(model.speed), parseFloat(model.range));
            //        }, 2000);
            //        //}
            //    } else {
            //        $scope.acceleration.direction = 'stop';
            //    }
            //});
        }

        function onWatchAccelerationError() {
            alert('Error getting accelerometer data!');
        }

        var currentSpeed, currentRangeInCm;
        function robotStartDrive(speed, rangeInCm) {
            if (model.gameStarted) {
                currentSpeed = speed;
                currentRangeInCm = rangeInCm;
                driveCounter = 0;
                model.robotDriving = true;
                var driveSpeed = speed;// * 0.25;
                var turn = 0.0;
                robot.startTravelData();//function (msg) { alert("succes! => " + msg); }, function (msg) { alert("Error! => " + msg); });
                robot.drive(driveSpeed, turn, null, onRobotDriveSucces, function (msg) { alert("Error! => " + msg); });
            }
        };

        function onRobotDriveSucces(data) {
            if (model.gameStarted) {
                driveCounter++;
                var driveSpeed = currentSpeed;// * 0.25;
                var turn = 0.0;
                if (typeof onSuccess === "function") {
                    onSuccess(data);
                }
                if (data.leftEncoderTotalCm > currentRangeInCm || data.rightEncoderTotalCm > currentRangeInCm || data.leftEncoderTotalCm < -currentRangeInCm || data.rightEncoderTotalCm < -currentRangeInCm || driveCounter > 2000) {
                    robotStopDrive();
                    audioService.play('success');
                    //setTimeout(function () {
                    //    alert('Drive end! driveCounter: ' + driveCounter + ' | leftEncoderTotalCm: ' + data.leftEncoderTotalCm + ' | rightEncoderTotalCm: ' + data.rightEncoderTotalCm);
                    //}, 0);
                } else {
                    if (data.leftEncoderTotalCm >= (currentRangeInCm * 0.65)) {
                        driveSpeed = currentSpeed * 0.75;
                    }
                    if (data.leftEncoderTotalCm >= (currentRangeInCm * 0.85)) {
                        driveSpeed = currentSpeed * 0.50;
                    }
                    //Set timeout prevents overhead calling plugin:
                    robotDriveTimeoutId = setTimeout(function () {
                        robot.drive(driveSpeed, turn, null, onRobotDriveSucces, function (msg) { alert("Error! => " + msg); });
                    }, 50);
                }
            } else {
                robotStopDrive();
            }
        }

        function robotStopDrive() {
            if (robotDriveTimeoutId) {
                clearTimeout(robotDriveTimeoutId);
            }
            robot.stop();
            robot.stopTravelData();//function (msg) { alert("succes! => " + msg); }, function (msg) { alert("Error! => " + msg); });
            model.robotDriving = false;
        }

        function preloadSounds() {
          for (var i = 0, length = soundFiles.length; i < length; i++) {
              var sound = soundFiles[i];
              audioService.preloadSimple(sound.id, sound.path);
          }
        }

    };

})();
