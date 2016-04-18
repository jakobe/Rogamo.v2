(function () {
  'use strict';

  angular.module('app')
  .controller('KurentoPointerController', KurentoPointerController);

  KurentoPointerController.$inject = ['$scope', 'RobotEngine' ,'$timeout'];

  function KurentoPointerController($scope, robot, $timeout) {
    var vm = this;

    vm.videoWidth = "640";
    vm.sendVideoOnly = false;
    vm.videoFrameRate = "15";

    vm.start = start;
    vm.pauseresume = pauseresume;
    vm.pauseResumeTitle = "Pause";
    vm.stop = stop;
    vm.calibrate = calibrate;
    vm.drive = drive;

    //////////////////////////////////

    $scope.$on('$ionicView.leave', function (viewInfo, state) {
      stop();
    });

    function start() {
      var videoInput = document.getElementById('videoInput'),
          videoOutput = document.getElementById('videoOutput');
      //videoInput = document.createElement('video');
      //videoOutput = document.createElement('video');

      var options = {
        videoWidth: parseInt(vm.videoWidth),
        videoFrameRate: parseInt(vm.videoFrameRate),
        videoInput: videoInput,
        videoOutput: videoOutput,
        sendVideoOnly: vm.sendVideoOnly
      };
      robot.startPointerDetection(options)
      .then(function(inputVideo) {
        addPointerDetectionWindows(inputVideo);
        vm.started = true;
        vm.inputDimensions = "INPUT VIDEO - w: " + inputVideo.videoWidth + ", h: " + inputVideo.videoHeight;
        //vm.outputDimensions = "OUTPUT VIDEO - w: " + pointerDetector.output.videoWidth + ", h: " + pointerDetector.output.videoHeight;
      });
    }

    function stop() {
      robot.stop();
      robot.stopPointerDetection();
      vm.started = vm.paused = false;
      vm.pauseResumeTitle = "Pause";
    }

    function pauseresume() {
      // if (vm.paused) {
      //   if (pointerDetector)
      //     pointerDetector.resume();
      // } else {
      //   robot.stop();
      //   if (pointerDetector)
      //     pointerDetector.pause();
      // }
      // vm.pauseResumeTitle = vm.paused ? "Pause" : "Resume";
      // vm.paused = !vm.paused;
    }

    function drive() {
      robot.drive(0.5, 0, 200);
    }

    function addPointerDetectionWindows(inputVideo) {
      var videoWidth = inputVideo.videoWidth,
      videoHeight = inputVideo.videoHeight;

      var padding = 50,
      windowWidth = videoWidth - (padding * 2),
      windowHeight = Math.round(videoHeight * 0.6) - (padding * 2);

      var upperWindow = {
        id: 'upper',
        width: windowWidth,
        height: windowHeight,
        upperRightX: padding,
        upperRightY: padding
      };

      var lowerWindow = {
        id: 'lower',
        width: windowWidth,
        height: windowHeight,
        upperRightX: padding,
        upperRightY: padding + windowHeight
      };
      robot.addPointerDetectionWindows(upperWindow, windowIn, windowOut);
    }

    function windowIn(data) {
      console.log("WindowIn event detected in window " + data.windowId);
      switch (data.windowId) {
        case "upper":
        robot.stop();
        //filter.removeWindow('upper', onError);
        //addLowerWindow();
        break;
        case "lower":
        //filter.removeWindow('lower', onError);
        //setTimeout(addUpperWindow, 2000);
        break;
      }
    };

    function windowOut(data) {
      console.log("WindowOut event detected in window " + data.windowId);
    };

    function calibrate() {
      robot.calibratePointerDetection();
    }

  }

})();
