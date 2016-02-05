(function () {
    'use strict';

    angular.module('app.core')
    .factory('EggThrowGame', EggThrowGame);

    EggThrowGame.$inject = ['RobotProvider', '$ionicPlatform'];

    function EggThrowGame(robot, $ionicPlatform) {
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
            audioPlugin,
            sounds = {};

        function playSound(soundId) {
            var sound = sounds[soundId];
            if (sound && sound instanceof HTMLAudioElement) {
                sound.play();
            } else if (audioPlugin) {
                audioPlugin.play(soundId, function (msg) { }, function (msg) { playSoundError(soundId); });
            } else {
                playSoundError(soundId);
            }
        }

        function playSoundError(soundId) {
            console.log('Could not play sound: "' + soundId + '"')
        }

        $ionicPlatform.ready(function () {
            if (window.plugins && window.plugins.NativeAudio) {
                audioPlugin = window.plugins.NativeAudio;
            }
            var soundFiles = [
                { id: 'success', path: 'audio/109663__grunz__success_low.wav' },
                { id: 'gameover', path: 'audio/82248__robinhood76__01299-smashing-egg-1.wav' }
            ];
            for (var i = 0, length = soundFiles.length; i < length; i++) {
                var sound = soundFiles[i];
                if (audioPlugin) {
                    audioPlugin.preloadSimple(sound.id, sound.path);
                } else {
                    sounds[sound.id] = new Audio(sound.path);
                }
            }
            if (window.device && window.device.platform === 'iOS' && window.cordova && window.cordova.plugins.doubleRobotics) {
                robot = window.cordova.plugins.doubleRobotics;
            }
        });

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
                if (navigator.accelerometer) {
                    var watchOptions = { frequency: 100 };
                    accelerometerWatchID = navigator.accelerometer.watchAcceleration(onWatchAccelerationSuccess, onWatchAccelerationError, watchOptions);
                }
            });
            robot.kickstand(robot.kickstandsCommands.up);
            setTimeout(function () {
                model.gameStarted = true;
                robotStartDrive(parseFloat(model.speed), parseFloat(model.range) * 100);
            }, 3000);
        };

        function stop() {
            robotStopDrive();
            model.gameStarted = false;
            stopAccelerometer();
            //setTimeout(function () { robot.kickstand(robot.kickstandsCommands.down); }, 500);
        };

        function stopAccelerometer() {
            if (navigator.accelerometer && accelerometerWatchID) {
                navigator.accelerometer.clearWatch(accelerometerWatchID);
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
                    playSound('gameover');
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
                    playSound('success');
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
                robot.variableDrive('drive', driveSpeed, turn, onRobotDriveSucces, function (msg) { alert("Error! => " + msg); });
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
                if (data.leftEncoderDeltaCm > currentRangeInCm || data.rightEncoderDeltaCm > currentRangeInCm || data.leftEncoderDeltaCm < -currentRangeInCm || data.rightEncoderDeltaCm < -currentRangeInCm || driveCounter > 2000) {
                    robotStopDrive();
                    playSound('success');
                    //setTimeout(function () {
                    //    alert('Drive end! driveCounter: ' + driveCounter + ' | leftEncoderDeltaCm: ' + data.leftEncoderDeltaCm + ' | rightEncoderDeltaCm: ' + data.rightEncoderDeltaCm);
                    //}, 0);
                } else {
                    if (data.leftEncoderDeltaCm >= (currentRangeInCm * 0.65)) {
                        driveSpeed = currentSpeed * 0.75;
                    }
                    if (data.leftEncoderDeltaCm >= (currentRangeInCm * 0.85)) {
                        driveSpeed = currentSpeed * 0.50;
                    }
                    //Set timeout prevents overhead calling plugin:
                    robotDriveTimeoutId = setTimeout(function () {
                        robot.variableDrive('drive', driveSpeed, turn, onRobotDriveSucces, function (msg) { alert("Error! => " + msg); });
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
            robot.variableDrive('drive', 0, 0);
            robot.stopTravelData();//function (msg) { alert("succes! => " + msg); }, function (msg) { alert("Error! => " + msg); });
            model.robotDriving = false;
        }

    };

})();