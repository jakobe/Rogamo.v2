(function () {
    'use strict';

    angular.module('app')
    .controller('PongGameController', PongGameController);

    PongGameController.$inject = ['$scope', '$timeout', '$ionicPlatform', '$ionicPopover', 'PongGame', 'RobotEngine'];

    function PongGameController($scope, $timeout, $ionicPlatform, $ionicPopover, game, robot) {
      var vm = this,
          gameStartPromise;

      vm.secondsToGameStart = -1;

      vm.numberOfPlayers = {
        value: 4,
        min: 3,
        max: 8
      };
      vm.range = {
        value: 2,
        min: 1,
        max: 5
      };
      vm.pushRange = {
        value: 0.5,
        min: 0,
        max: 2
      };
      vm.maxSpeed = {
        value: 0.5,
        min: 0.2,
        max: 1.0
      };
      vm.maxTurn = {
        value: 0.0,
        min: 0.0,
        max: 1.0
      };
      vm.minRotation = {
        value: 90,
        min: 90,
        max: 180
      };
      vm.pushWait = {
        value: 4,
        min: 0,
        max: 10
      };
      vm.numberOfPointsToWin = {
        value: 5,
        min: 1,
        max: 10
      };
      vm.videoWidth = "640";
      vm.videoFrameRate = "15";
      vm.inputVideo = {
        videoWidth: 0,
        videoHeight: 0
      }

      vm.enableFIWare = true;
      vm.successImage = '#';
      vm.debug = false;

      vm.containerStyle = {
        //'background-color': 'green'
      };
      vm.startCalibration = startCalibration;
      vm.startGame = startGame;
      vm.stopGame = stopGame;
      vm.retractKickstands = robot.retractKickstands;
      vm.deployKickstands = robot.deployKickstands;
      window.successImageLoaded = _successImageLoaded;
      vm.calibrate = calibrate;
      vm.closeCalibratePopover = closeCalibratePopover;
      vm.isPointerDetectionStarted = false;
      vm.isCalibrated = false;

      initPopover();

      /////////////////////////
      $scope.$on('$ionicView.leave', function (viewInfo, state) {
        robot.stopPointerDetection();
      });

      function initPopover() {
        var videoWidth = parseInt(vm.videoWidth),
            videoHeight = videoWidth;

        if (window.orientation === 0) {
          videoWidth = Math.round(videoWidth * 0.75);
        } else {
          videoHeight = Math.round(videoHeight * 0.75);
        }

        var popoverHeight = videoHeight + 100;

        var popoverTemplate = '<ion-popover-view style="height: ' + popoverHeight + 'px; width: 98%;">'+
                      //  '  <ion-header-bar>'+
                      //  '    <h1 class="title">Kalibrer spillefarve</h1>'+
                      //  '  </ion-header-bar>'+
                       '  <ion-content style="text-align: center;">'+
                       '    <video id="videoInput" style="margin: auto; width: ' + videoWidth + 'px; height: ' + videoHeight + 'px;" autoplay poster="img/kurento-mirrored.png"></video>'+
                       //'    <video id="videoOutput" style="margin: auto; width: 640px; height: 480px; border: 1px solid #ccc;" autoplay poster="img/kurento-mirrored.png"></video>'+
                       '    <button style="margin: 20px 4px" class="button button-positive icon-left ion-ios-color-wand" ng-click="vm.calibrate()" ng-disabled="!vm.isPointerDetectionStarted">Kalibrer</button>'+
                       '    <button style="margin: 20px 4px" class="button button-balanced icon-left ion-ios-close" ng-click="vm.closeCalibratePopover()">Luk</button>'+
                       '  </ion-content>'+
                       '</ion-popover-view>';
        $scope.popover = $ionicPopover.fromTemplate(popoverTemplate, {
          scope: $scope
        });

        if (window.device.platform === 'iOS') {
          $scope.$on('popover.shown', refreshVideos);
          $scope.$on('popover.hidden', refreshVideos);
        };

        function refreshVideos() {
          $timeout(cordova.plugins.iosrtc.refreshVideos, 10);
        }

        $scope.$on('$destroy', function() {
          $scope.popover.remove();
        });

      }

      function startCalibration($event) {
        $scope.popover.show($event);
        var videoInput = document.getElementById('videoInput'),
            videoOutput = document.getElementById('videoOutput');

        var options = {
          videoWidth: parseInt(vm.videoWidth),
          videoFrameRate: parseInt(vm.videoFrameRate),
          videoInput: videoInput,
          videoOutput: videoOutput,
          sendVideoOnly: true//vm.sendVideoOnly
        };
        if (!vm.isPointerDetectionStarted) {
          robot.startPointerDetection(options)
          .then(function(inputVideo) {
            vm.isPointerDetectionStarted = true;
            vm.inputVideo = inputVideo;
          });
        }
      }

      function startGame($event) {
        vm.containerStyle['background-color'] = 'rgb(185, 175, 255)';
        var gameSettings = _getGameSettings();
        game.init(gameSettings, _showImage, _startDrive, _gameOver, _robotPush);
        _countDownToGameStart(3);
        vm.gameStarted = true;
      }

      function _countDownToGameStart(seconds) {
        vm.secondsToGameStart = seconds;
        if (seconds === 0) {
          game.play();
        } else {
          gameStartPromise = $timeout(function() {
            _countDownToGameStart(seconds-1);
          }, 1000);
        }
      }

      function _robotPush(collision) {
        $scope.$apply(function () {
          vm.successImage = '#';
          vm.containerStyle['data-background-color-orig'] = vm.containerStyle['background-color'];
          vm.containerStyle['background-color'] = 'green';
        });
      }

      function _showImage(imagePath) {
        vm.successImage = imagePath;
      }

      function _successImageLoaded(img) {
        var mode = (img.naturalHeight > img.naturalWidth) ? 'portrait' : 'landscape';
        img.style.height = (mode === 'portrait') ? '75%' : 'inherit';
        img.style.width = (mode === 'landscape') ? '95%' : 'inherit';
        //img.style.top = (mode === 'landscape') ? '-150px' : '-120px';
      }

      function _startDrive() {
        //$scope.$apply(function () {
          if (vm.containerStyle['data-background-color-orig'] != undefined) {
            vm.containerStyle['background-color'] = vm.containerStyle['data-background-color-orig'];
            delete vm.containerStyle['data-background-color-orig'];
          }
        //});
      }

      function _gameOver(success, winner) {
        if (success) {
          //$scope.$apply(function () {
            vm.winner = winner;
          //});
          /*$timeout(function() {
            alert('Tillykke! \'' + winner.name + '\' har vundet med ' + winner.points + ' point.');
            delete vm.winner;
            stopGame();
          }, 500)*/
        } else {
          alert('Spillet er slut.');
          //$scope.$apply(function () {
            stopGame();
          //});
        }
      }

      function stopGame() {
        $timeout.cancel(gameStartPromise);
        game.stop();
        vm.successImage = '#';
        vm.gameStarted = false;
        delete vm.winner;
      }


      function closeCalibratePopover() {
        $scope.popover.hide();
      }

      function _getGameSettings() {
        var rangeInCm = parseFloat(vm.range.value) * 100,
            outerRangeFactor = 1.3,
            maxOuterRangeInCm = (rangeInCm * outerRangeFactor);
        return {
          numberOfPlayers: parseInt(vm.numberOfPlayers.value),
          rangeInCm: rangeInCm,
          maxOuterRangeInCm: maxOuterRangeInCm,
          pushRangeInCm: parseFloat(vm.pushRange.value) * 100,
          maxSpeed: parseFloat(vm.maxSpeed.value),
          maxTurn: parseFloat(vm.maxTurn.value),
          minRotationInDegrees: parseInt(vm.minRotation.value),
          pushWaitInMs: parseFloat(vm.pushWait.value) * 1000,
          totalPointsToWin: parseInt(vm.numberOfPointsToWin.value),
          enablePointerDetection : vm.enableFIWare,
          inputVideo: vm.inputVideo,
          debug: vm.debug
        };
      }

      function calibrate() {
        robot.calibratePointerDetection();
        vm.isCalibrated = true;
      }

    }

})();
