(function () {
    'use strict';

    angular.module('app')
    .controller('RobotControlsController', RobotControlsController);

    RobotControlsController.$inject = ['$scope', 'RobotEngine', '$http'];

    function RobotControlsController($scope, robot, $http) {

        console.log("RobotControlsController init...");

        $scope.labels = ["0", "200"];
        $scope.series = ['Drive'];
        $scope.data = [
            [1, 0]
        ];

        robot.watchTravelData(onTravelData);

        var audioPlugin = window.plugins ? window.plugins.NativeAudio : null,
            sounds = {};
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

        function playSoundError(soundId, msg) {
            alert('Could not play sound: "' + soundId + '" (error: ' + msg + ')');
        }

        var soundFiles = [
                { id: 'success', path: 'audio/109663__grunz__success_low.wav' },
                { id: 'beep', path: 'audio/Speech On.wav' }

        ];
        for (var i = 0, length = soundFiles.length; i < length; i++) {
            var sound = soundFiles[i];
            if (audioPlugin) {
                audioPlugin.preloadSimple(sound.id, sound.path);
            } else {
                sounds[sound.id] = new Audio(sound.path);
            }
        }

        var next50Cm = 50;
        var maxRange = 0;
        var rangeWhenStopDriving = 0;
        var rangeDrivenToStop = 0;
        function onTravelData(traveldata) {
            if (traveldata.leftEncoderTotalCm > maxRange) {
                maxRange = traveldata.leftEncoderTotalCm;
                rangeDrivenToStop = maxRange - rangeWhenStopDriving;
            }

            var labels = [];
            var data = [];
            var driveDataToDisplay = '';
            for (var i = 0; i < traveldata.driveData.length; i++) {
                var entry = traveldata.driveData[i];
                if (typeof entry.speed !== 'undefined') {
                    var speed = entry.speed;
                    var range = entry.range;
                    if (speed === 0.0 && rangeWhenStopDriving === 0.0) {
                        rangeWhenStopDriving = range;
                    }
                    data.push(speed);
                    labels.push(range);
                }
                if (entry.stop) {
                    driveDataToDisplay += entry.stop + '\n';
                } else if (typeof entry.speed !== 'undefined') {
                    driveDataToDisplay += 'speed: ' + entry.speed + ' | range: ' + entry.range + ' | ' + entry.time + '\n';
                }
            }
            var lastDrive = traveldata.lastDrive,
                            dataToUpload;
            if (lastDrive) {
                dataToUpload = [lastDrive.time, lastDrive.speed, lastDrive.start];
                console.log(dataToUpload);
                uploadData(dataToUpload);
            }

            // Handle the online event
            $scope.$apply(function () {
                $scope.doubleRobotics = {
                    serial: "00-000000",
                    message: "left: " + traveldata.leftEncoderTotalCm + " | right: " + traveldata.rightEncoderTotalCm + " | max: " + maxRange + " | rangeDrivenToStop: " + rangeDrivenToStop
                };
                $scope.driveData = driveDataToDisplay;
                $scope.labels = labels;
                $scope.data = [data];
            });
        }

        var doUpload = true,
            uploadRetryInMs = 30 * 1000; //Retry in 30 seconds
        function uploadData(data) {
            if (doUpload) {
                var url = 'http://basher01:1004/upload';
                $http.post(url, data).then(function successCallback(response) {
                    console.log(response);
                },
                function errorCallback(response) {
                    console.log(response);
                    doUpload = false;
                    setTimeout(function () {
                        doUpload = true;
                    }, uploadRetryInMs)
                });
            }
        }

        $scope.doubleRobotics = {
            serial: "00-000000",
            message: ""
        }

        $scope.model = {
            degrees: null,
            speed: 0.5
        }

        $scope.retractKickstands = robot.retractKickstands;
        $scope.deployKickstands = robot.deployKickstands;

        $scope.poleDown = robot.poleDown;
        $scope.poleStop = robot.poleStop;
        $scope.poleUp = robot.poleUp;

        $scope.turnByDegrees = function (degrees) {
            robot.turnByDegrees(degrees)//, function (data) { alert("Succes! => " + data.message); }, function (data) { alert("Error! => " + data.message); });
        }

        $scope.drive = function (direction, turn, range) {
            next50Cm = 50;
            maxRange = 0;
            rangeWhenStopDriving = 0.0;
            robot.drive(direction, turn, range,
                function (data) {
                    $scope.doubleRobotics = data;
                },
                function (msg) { alert("Error! => " + msg); }
            );
        };

        $scope.stop = function () {
            robot.stop();
        }

    };

})();
