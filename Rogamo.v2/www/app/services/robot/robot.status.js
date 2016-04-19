(function () {
  'use strict';

  angular.module('app.core')
  .factory('RobotStatus', RobotStatus);

  RobotStatus.$inject = ['RobotEngine', 'OrionService', '$timeout', '$q'];

  function RobotStatus(robot, orionService, $timeout, $q) {
    var initialized = false,
        deferred = $q.defer(),
        newTravelData = null,
        robotStatus = {
          getSerial: getSerial
        };

    _init();

    return robotStatus;

    function _init() {
      var timeoutPromise = $timeout(function() {
            robot.clearWatchBatteryStatus(onBatteryStatus);
            deferred.reject("Get robot serial timed out.");
      }, 10000);

      function onBatteryStatus(status) {
        if (!initialized) {
          $timeout.cancel(timeoutPromise);
          deferred.resolve(status.serial);
          robot.watchTravelData(_onTraveldata);
          setInterval(function() {
            _uploadTravelData(status.serial);
          }, 400);
        }
        _uploadStatus(status);
      }
      robot.watchBatteryStatus(onBatteryStatus);
    }

    function getSerial() {
      return deferred.promise;
    }

    function _onTraveldata(traveldata) {
      newTravelData = traveldata;
    }

    function _uploadTravelData(robotSerial) {
      if (newTravelData) {
        var dataToUpload = {
            speed: Math.abs(Math.round(newTravelData.speed))
        };
        //console.log(dataToUpload);
        orionService.uploadRobotData(robotSerial, dataToUpload);
        newTravelData = null;
      }
    }

    function _uploadStatus(status) {
      /*
      *** status: ***
      batteryPercent: 100,
      batteryIsFullyCharged: true,
      kickstandState: 0,
      poleHeightPercent: 0.0
      robotSerial: '00-00FAKE',
      firmwareVersion: '1004'
      */
      var dataToUpload = {
          battery: Math.round(status.batteryPercent * 100),
          speed: 0,
          firmwareversion: parseInt(status.firmwareVersion),
          geolocation: ["56.16293900", "10.20392100"]
      };
      orionService.uploadRobotData(status.serial, dataToUpload);
    }

  }

})();
