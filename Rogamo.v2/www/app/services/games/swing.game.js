(function () {
    'use strict';

    angular.module('app.core')
    .factory('SwingGame', SwingGame);

    SwingGame.$inject = ['$cordovaRobot', '$ionicPlatform'];

    function SwingGame(robot, $ionicPlatform) {
        var model = null,
            onSuccess,
            onFailure,
            onGameOver,
            onRobotPush,
            driveCounter = 0,
            points = 0,
            totalPointsToWin = 5,
            direction = 1,
            robotDriveTimeoutId = null,
            audioPlugin,
            sounds = {},
            backgroundSound = { id: 'background', path: 'audio/swing/268079__rbnx__birds-spring-mono-02.mp3' };

        function playSound(soundId) {
            var sound = sounds[soundId];
            if (sound && sound instanceof HTMLAudioElement) {
                sound.play();
            } else if (audioPlugin) {
                audioPlugin.play(soundId, function (msg) { }, function (msg) { playSoundError(soundId, msg); });
            } else {
                playSoundError(soundId);
            }
        }

        function loopSound(soundId) {
            var sound = sounds[soundId];
            if (sound && sound instanceof HTMLAudioElement) {
                sound.play();
            } else if (audioPlugin) {
                audioPlugin.loop(soundId, function (msg) { }, function (msg) { playSoundError(soundId, msg); });
            } else {
                playSoundError(soundId);
            }
        }

        function stopSound(soundId) {
            var sound = sounds[soundId];
            if (sound && sound instanceof HTMLAudioElement) {
                sound.pause();
            } else if (audioPlugin) {
                audioPlugin.stop(soundId, function (msg) { }, function (msg) { stopSoundError(soundId, msg); });
            }
        }

        function playSoundError(soundId, msg) {
            console.log('Could not play sound: "' + soundId + '" (error: ' + msg + ')');
        }

        function stopSoundError(soundId, msg) {
            console.log('Could not stop sound: "' + soundId + '" (error: ' + msg + ')');
        }

        $ionicPlatform.ready(function () {
            if (window.plugins && window.plugins.NativeAudio) {
                audioPlugin = window.plugins.NativeAudio;
            }

            try {
                window.addEventListener("batterystatus", onBatteryStatus, false);
            }
            catch (err) {
                alert(err);
            }

            try {
                window.addEventListener("batterylow", onBatteryLow, false);
            }
            catch (err) {
                alert(err);
            }

            function onBatteryLow(status) {
                // Handle the online event
                alert("BatteryLow! Level: " + status.batteryPercent + "\n" +
                      "batteryIsFullyCharged: " + status.batteryIsFullyCharged);
            }


            function onBatteryStatus(status) {
                // Handle the online event
                //setTimeout(function () { playSound('success') }, 0);
                //alert("Level: " + status.batteryPercent + "\n" + "batteryIsFullyCharged: " + status.batteryIsFullyCharged);
            }

            var soundFiles = [
                { id: 'success', path: 'audio/109663__grunz__success_low.wav' },
                { id: 'laughter_soft_1', path: 'audio/swing/273152__hoerspielwerkstatt-hef__child-laughs_1.wav' },
                { id: 'laughter_soft_2', path: 'audio/swing/55209a__noisecollector__laughingkidagain.wav' },
                { id: 'laughter_medium_1', path: 'audio/swing/242932__obxjohn__child-laughing-wav-file.wav' },
                { id: 'laughter_hard_1', path: 'audio/swing/135387__ashjenx__child-laughing.wav' },
                { id: 'laughter_hard_2', path: 'audio/swing/184616__kim-headlee__young-female-child-laughing.wav' },
                { id: 'laughter_hard_3', path: 'audio/swing/315828__benjaminharveydesign__shriek-3-and-laugh.aiff' }
            ];
            for (var i = 0, length = soundFiles.length; i < length; i++) {
                var sound = soundFiles[i];
                if (audioPlugin) {
                    audioPlugin.preloadSimple(sound.id, sound.path);
                } else {
                    sounds[sound.id] = new Audio(sound.path);
                }
            }
            var backgroundSoundVolume = 0.5,
                backgroundSoundVoices = 1.0,
                backgroundSoundDelay = 0.0;
            if (audioPlugin) {
                audioPlugin.preloadComplex(backgroundSound.id, backgroundSound.path, backgroundSoundVolume, backgroundSoundVoices, backgroundSoundDelay,
                    function (msg) {
                        console.log('Succes: ' + msg);
                    },
                    function (msg) {
                        console.log('Error: ' + msg);
                    });
            } else {
                sounds[backgroundSound.id] = new Audio(backgroundSound.path);
                sounds[backgroundSound.id].loop = true;
                sounds[backgroundSound.id].volume = backgroundSoundVolume;
            }
        });

        var game = {
            init: init,
            play: play,
            stop: stop,
            pushSwing: pushSwing
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
                loopSound(backgroundSound.id);
            });
            robot.retractKickstands();
            try {
                window.addEventListener("traveldata", onTravelData, false);
            }
            catch (err) {
                alert(err);
            }
            setTimeout(function () {
                model.gameStarted = true;
            }, 3000);
        }

        function stop() {
            robotStopDrive();
            model.gameStarted = false;
            stopSound(backgroundSound.id);
            //setTimeout(function () { robot.deployKickstands(); }, 500);
        }

        var swingOut = false;
        function pushSwing(force) {
            var returnRangeLeftInCm = 0;
            if (model.robotDriving) {
                robotStopDrive();
                returnRangeLeftInCm = currentRangeInCm - model.robotData.leftEncoderDeltaCm;
            }
            if (!model.robotDriving) {
                var rangeInCm = (parseFloat(model.range) * 100) - returnRangeLeftInCm;
                var speed = -(parseFloat(model.speed));
                swingOut = true;
                switch (force) {
                    case 'soft':
                        var softSounds = ['laughter_soft_1', 'laughter_soft_2'];
                        var randomSound = softSounds[Math.floor(Math.random() * softSounds.length)];
                        playSound(randomSound);
                        rangeInCm -= (model.rangeLowDelta * 100);
                        speed = speed * 0.5;
                        robotStartDrive(speed, rangeInCm, onSwingOut);
                        break;
                    case 'medium':
                        playSound('laughter_medium_1');
                        rangeInCm -= (model.rangeMediumDelta * 100);
                        speed = speed * 0.75;
                        robotStartDrive(speed, rangeInCm, onSwingOut);
                        break;
                    case 'hard':
                        var hardSounds = ['laughter_hard_1', 'laughter_hard_2', 'laughter_hard_3'];
                        var randomSound = hardSounds[Math.floor(Math.random() * hardSounds.length)];
                        playSound(randomSound);
                        robotStartDrive(speed, rangeInCm, onSwingOut);
                        break;
                }
            }
        }

        function onSwingOut(speed, rangeInCm) {
            //playSound('laughter_soft_1');
            var swingBackPauseInMs = parseFloat(model.swingbackpause) * 1000;
            setTimeout(function () {
                robotStartDrive(-speed, rangeInCm);
            }, swingBackPauseInMs);
        }

        var currentRangeInCm = 0;
        function robotStartDrive(speed, rangeInCm, onDriveEnd) {
            if (model.gameStarted) {
                driveCounter = 0;
                model.robotDriving = true;
                var maxSpeed = speed;
                var turn = 0.0;

                //robot.drive(driveSpeed, turn);
                var startTime = new Date();
                var totalTimeInMs = parseFloat(model.swingduration) * 1000;
                var intervalInMs = 200;

                robotDriveTimeoutId = setTimeout(function () { setRobotSpeed(maxSpeed, turn, startTime, totalTimeInMs, intervalInMs); }, intervalInMs);

                //var driveSpeed = speed;// * 0.25;
                //currentRangeInCm = rangeInCm;
                //robot.drive(driveSpeed, turn, rangeInCm);


                //robot.startTravelData();//function (msg) { alert("succes! => " + msg); }, function (msg) { alert("Error! => " + msg); });
                //robot.drive(driveSpeed, turn, null, function (data) { onRobotDriveSucces(data, speed, rangeInCm, onDriveEnd); }, function (msg) { alert("Error! => " + msg); });
            }
        }

        function calculateCurrentSpeed(maxSpeed, elapsed, total) {
            return maxSpeed * Math.sin((elapsed / total) * Math.PI)
        }

        function setRobotSpeed(maxSpeed, turn, startTime, totalTimeInMs, intervalInMs) {
            var now = new Date();
            var elapsedTimeInMs = now - startTime;
            if (elapsedTimeInMs < totalTimeInMs) {
                console.log("elapsedTimeInMs: " + elapsedTimeInMs);
                var currentSpeed = calculateCurrentSpeed(maxSpeed, elapsedTimeInMs, totalTimeInMs);
                robot.drive(currentSpeed, turn);
                robotDriveTimeoutId = setTimeout(function () { setRobotSpeed(maxSpeed, turn, startTime, totalTimeInMs, intervalInMs); }, intervalInMs);
            } else {
                robotStopDrive();
                if (swingOut) {
                    swingOut = false;
                    onSwingOut(maxSpeed);
                }
            }
        }

        function onTravelData(traveldata) {
            if (typeof onSuccess === "function") {
                onSuccess(traveldata);
            }
            //if (swingOut) {
            //    if (Math.abs(traveldata.leftEncoderDeltaCm) > currentRangeInCm || Math.abs(traveldata.rightEncoderDeltaCm) > currentRangeInCm) {
            //        robotStopDrive();
            //        swingOut = false;
            //        //setTimeout(function() {playSound('success')}, 0);
            //        var speed = -(parseFloat(model.speed));
            //        //onSwingOut(speed, currentRangeInCm)
            //    }
            //}
        }

        function onRobotDriveSucces(data, speed, rangeInCm, onDriveEnd) {
            if (model.gameStarted) {
                driveCounter++;
                var driveSpeed = 0,
                    turn = 0.0;
                if (typeof onSuccess === "function") {
                    onSuccess(data);
                }
                if (Math.abs(data.leftEncoderDeltaCm) > rangeInCm || Math.abs(data.rightEncoderDeltaCm) > rangeInCm || driveCounter > 2000) {
                    robotStopDrive();
                    //setTimeout(function() {playSound('success')}, 0);
                    if (typeof onDriveEnd === 'function') {
                        onDriveEnd(speed, rangeInCm);
                    }
                } else {
                    model.currentSpeed = driveSpeed = deAccelerate(speed, rangeInCm, Math.abs(data.leftEncoderDeltaCm));
                    //Set timeout prevents overhead calling plugin:
                    robotDriveTimeoutId = setTimeout(function () {
                        robot.drive(driveSpeed, turn, null, function (data) { onRobotDriveSucces(data, speed, rangeInCm, onDriveEnd); }, function (msg) { alert("Error! => " + msg); });
                    }, 20);
                }
            } else {
                robotStopDrive();
            }
        }

        function deAccelerate(speed, totalRangeInCm, currentRangeInCm) {
            var driveSpeed = speed;
            if (currentRangeInCm >= (totalRangeInCm * 0.40)) {
                driveSpeed = speed * 0.80;
            }
            if (currentRangeInCm >= (totalRangeInCm * 0.55)) {
                driveSpeed = speed * 0.60;
            }
            if (currentRangeInCm >= (totalRangeInCm * 0.70)) {
                driveSpeed = speed * 0.40;
            }
            //if (currentRangeInCm >= (totalRangeInCm * 0.85)) {
            //    driveSpeed = speed * 0.30;
            //}
            //if (currentRangeInCm >= (totalRangeInCm * 0.95)) {
            //    driveSpeed = speed * 0.20;
            //}
            //if (currentRangeInCm >= (rangeInCm * 0.80)) {
            //    driveSpeed = speed * 0.10;
            //}
            return driveSpeed;
        }

        function robotStopDrive() {
            if (robotDriveTimeoutId) {
                clearTimeout(robotDriveTimeoutId);
                robotDriveTimeoutId = null;
            }
            robot.stop();
            robot.stopTravelData();//function (msg) { alert("succes! => " + msg); }, function (msg) { alert("Error! => " + msg); });
            model.robotDriving = false;
        }

    };

})();