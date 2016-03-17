(function () {
    'use strict';

    angular.module('app')
    .controller('AccelerometerController', AccelerometerController);

    AccelerometerController.$inject = ['$scope', 'RobotEngine', '$http'];

    function AccelerometerController($scope, robot, $http) {
      var collisionWatchID,
          accelerometerWatchID,
          watching = true;

      init();

      function init() {
        setInitScope();
        detectCollisionsChange();
        accelerometerWatchID = watchAcceleration();
        //setTimeout(function() {
            //window.addEventListener("collision", onCollision, false);
        //    window.addEventListener("traveldata", onTraveldata, false);
        //}, 500);
      }

      function watchAcceleration() {
        var options = { frequency: 500 };
        if (navigator.accelerometer) {
            return navigator.accelerometer.watchAcceleration(onAccelerometerSuccess, onAccelerometerError, options);
        }
        return null;
      }

      function setInitScope() {
        $scope.acceleration = {
           x: 0,
           y: 0,
           z: 0,
           direction: 'stop'
        };
        $scope.userAcceleration = {
           x: 0,
           y: 0,
           z: 0,
           direction: 'stop'
        };
        $scope.collision = {
           type: '',
           direction: 'stop',
           force: 0.0
        };

        $scope.collisionSettings = {
           minAcceleration: 2.0,
           detectCollisions: true
        };

        $scope.detectCollisionsChange = detectCollisionsChange;

        $scope.retractKickstands = robot.retractKickstands;
        $scope.deployKickstands = robot.deployKickstands;
        $scope.turnByDegrees = robot.turnByDegrees;
        $scope.stop = robot.stop;
        $scope.drive = robot.drive;
      }

      $scope.stop = function() {
       var devicemotionEvent = new CustomEvent('devicemotion', {
         'detail' : {
           userAccelerationX: 1.0,
           userAccelerationY: 2.0,
           userAccelerationZ: 3.0
         }
       });
       window.dispatchEvent(devicemotionEvent);
      };

      function detectCollisionsChange() {
        if ($scope.collisionSettings.detectCollisions) {
          collisionWatchID = robot.watchCollision(onCollision);
        } else if (collisionWatchID) {
          robot.clearWatchCollision(collisionWatchID);
          collisionWatchID = null;
        }
      }

      function onCollision(collision) {
        robot.stop();
        robot.turnByDegrees(180);
        setTimeout(function() {
          $scope.$apply(function () {
            $scope.collision.direction = 'stop';
          });
        }, 1000);

        $scope.$apply(function () {
          $scope.collision = collision;
        });
        console.log('handleCollision - type: ' + collision.type + ' | direction: ' + collision.direction);
      }

    function onAccelerometerSuccess(acceleration) {
      $scope.$apply(function () {
        $scope.acceleration.x = acceleration.x;
        $scope.acceleration.y = acceleration.y;
        $scope.acceleration.z = acceleration.z;
        $scope.userAcceleration.x = acceleration.userAccelerationX;
        $scope.userAcceleration.y = acceleration.userAccelerationY;
        $scope.userAcceleration.z = acceleration.userAccelerationZ;
      });
    }

    function onAccelerometerError() {
      alert('Error getting accelerometer data!');
    }

    function onTraveldata(traveldata) {
      var lastDrive = traveldata.lastDrive,
      dataToUpload;
      if (lastDrive) {
        dataToUpload = [lastDrive.time, lastDrive.speed, lastDrive.start];
        console.log(dataToUpload);
        //uploadData(dataToUpload);
      }
    }
  }

})();
