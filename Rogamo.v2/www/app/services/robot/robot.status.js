(function () {
  'use strict';

  angular.module('app.core')
  .factory('RobotStatus', RobotStatus);

  RobotStatus.$inject = ['RobotEngine', 'OrionService', '$timeout', '$q'];

  function RobotStatus(robot, orionService, $timeout, $q) {
    var initialized = false,
        deferredSerial = $q.defer(),
        deferredGeolocation = $q.defer(),
        newTravelData = null,
        travelDataUploadIntervalInMs = 250,
        getBatteryStatusTimeoutInMs = 10000,
        robotStatus = {
          getSerial: getSerial,
          getGeolocation: getGeolocation
        };

    _init();

    return robotStatus;

    function _init() {
      var timeoutPromise = $timeout(function() {
        robot.clearWatchBatteryStatus(onBatteryStatus);
        deferredSerial.reject("Get robot serial timed out.");
        console.log("Get robot serial timed out.");
      }, getBatteryStatusTimeoutInMs);

      function onBatteryStatus(status) {
        if (!initialized) {
          initialized = true;
          $timeout.cancel(timeoutPromise);
          deferredSerial.resolve(status.serial);
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
      var geolocationOptions = {
        enableHighAccuracy: false,
        timeout: 5 * 1000, //5 seconds
        maximumAge: 10 * 60 * 1000 //10 minutes
      };
      navigator.geolocation.getCurrentPosition(_onGeolocationSuccess, _onGeolocationError, geolocationOptions)
    }

    function getSerial() {
      return deferredSerial.promise;
    }

    function getGeolocation() {
      return deferredGeolocation.promise;
    }

    function _onGeolocationSuccess(position) {
      console.log("Got geolocation...");
      deferredGeolocation.resolve(position);
    }

    function _onGeolocationError(error) {
      console.log("Geolocation error...");
      console.warn('ERROR(' + error.code + '): ' + error.message);
      deferredGeolocation.reject(error);
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
        getGeolocation().then(function (position) {
          // console.log("Upload traveldata...");
          orionService.uploadRobotData(robotSerial, position, dataToUpload);
        });
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
        firmwareversion: parseInt(status.firmwareVersion)
      };
      console.log("Upload new state...");
      getGeolocation().then(function (position) {
        console.log("Got geolocation - now upload...");
        orionService.uploadRobotData(status.serial, position, dataToUpload);
      });
    }

  }

})();
