(function () {
    'use strict';

    angular.module('app')
    .controller('RobotControlsController', RobotControlsController);

    RobotControlsController.$inject = ['$scope', 'RobotEngine', '$http'];

    function RobotControlsController($scope, robot, $http) {
        $scope.$on('$ionicView.enter', function() {
          robot.watchTravelData(onTravelData);
        });
        $scope.$on('$ionicView.leave', function() {
          robot.clearWatchTravelData(onTravelData);
        });

        console.log("RobotControlsController init...");

        $scope.labels = ["0", "200"];
        $scope.series = ['Drive'];
        $scope.data = [
            [1, 0]
        ];

        $scope.compassHeading = {
          magneticHeading: 0,
          startHeading: 0
        };

        $scope.setStartHeading = function() {
          navigator.compass.getCurrentHeading(function (heading) {
            $scope.compassHeading.startHeading = heading.magneticHeading;
          });
        };

        watchCompass();

        function watchCompass() {
          var options = {
              frequency: 100
          };
          var watchID = navigator.compass.watchHeading(compassSuccess, compassError, options);
        }

        function compassSuccess(heading) {
            $scope.$apply(function () {
              $scope.compassHeading.magneticHeading = heading.magneticHeading;
              $scope.compassHeading.angle = heading.magneticHeading - $scope.compassHeading.startHeading;
              if ($scope.compassHeading.angle < 0)
                $scope.compassHeading.angle += 360;
              $scope.compassHeading.userAngle = $scope.compassHeading.angle + 45;
              if ($scope.compassHeading.userAngle >= 360)
                $scope.compassHeading.userAngle -= 360;
              $scope.compassHeading.player = Math.floor($scope.compassHeading.userAngle / 90);
            });
        };

        function compassError(compassError) {
            alert('Compass error.\nError code: ' + compassError.code + '\nError: ' + compassError.text);
        };


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

            var dataToUpload = [traveldata.time, traveldata.speed, traveldata.start];
            console.log(dataToUpload);
            //uploadData(dataToUpload);

            $scope.$apply(function () {
                $scope.doubleRobotics = {
                    serial: "00-000000",
                    message: "left: " + traveldata.leftEncoderTotalCm + " | right: " + traveldata.rightEncoderTotalCm + " | max: " + maxRange + " | rangeDrivenToStop: " + rangeDrivenToStop
                };
            });
        }

        var doUpload = false,
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
                function (traveldata) {
                    if (range > 0) {
                      console.log('Drive Range end! Range: ' + traveldata.range);
                    }
                },
                function (msg) { alert("Error! => " + msg); }
            );
        };

        $scope.stop = function () {
            robot.stop();
        }

    };

})();
