(function () {
  'use strict';

  angular.module('app.core')
  .factory('RobotStatus', RobotStatus);

  RobotStatus.$inject = ['RobotEngine', 'OrionService', '$timeout', '$q'];

  function RobotStatus(robot, orionService, $timeout, $q) {
    var initialized = false,
        deferred = $q.defer(),
        newTravelData = null,
        travelDataUploadIntervalInMs = 250,
        getBatteryStatusTimeoutInMs = 10000,
        robotStatus = {
          getSerial: getSerial
        };

    _init();

    return robotStatus;

    function _init() {
      var timeoutPromise = $timeout(function() {
        robot.clearWatchBatteryStatus(onBatteryStatus);
        deferred.reject("Get robot serial timed out.");
      }, getBatteryStatusTimeoutInMs);

      function onBatteryStatus(status) {
        if (!initialized) {
          initialized = true;
          $timeout.cancel(timeoutPromise);
          deferred.resolve(status.serial);
          if (status.serial) {
            robot.watchTravelData(_onTraveldata);
            setInterval(function() {
              _uploadTravelData(status.serial);
            }, travelDataUploadIntervalInMs);

          } else {
            alert('Robot er ikke forbundet til iPad\'en.\nCheck at bluetooth er slået til og robotten er tændt.');
          }
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
        // console.log("Upload traveldata...");
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
      // console.log("Upload new state...");
      orionService.uploadRobotData(status.serial, dataToUpload);
    }

  }

})();
