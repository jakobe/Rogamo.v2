(function () {
    'use strict';

    angular.module('app')
    .controller('AccelerometerController', AccelerometerController);

    AccelerometerController.$inject = ['$scope', 'RobotEngine', '$http'];

    function AccelerometerController($scope, robot, $http) {
      var collisionWatchID,
          accelerometerWatchID;

      init();

      function init() {
        setInitScope();
        detectCollisionsChange();
        robot.watchTravelData(onTraveldata);
        accelerometerWatchID = watchAcceleration();
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

      // $scope.stop = function() {
      //  var devicemotionEvent = new CustomEvent('devicemotion', {
      //    'detail' : {
      //      userAccelerationX: 1.0,
      //      userAccelerationY: 2.0,
      //      userAccelerationZ: 3.0
      //    }
      //  });
      //  //window.dispatchEvent(devicemotionEvent);
      //  var url = 'http://195.225.105.124/orion/server/crossDomainOrionCB.php';//'http://130.206.125.182:1026/v1/updateContext';
      //  var orionData = {
      //    "contextElements": [
      //      {
      //        "type": "robot",
      //        "isPattern": "false",
      //        "id": "jakob",
      //        "attributes": [
      //          {
      //            "name": "hest",
      //            "type": "float",
      //            "value": "37.90"
      //          },
      //          {
      //            "name": "fullname",
      //            "type": "string",
      //            "value": "Jakob Engelbrecht Olesen"
      //          }
      //        ]
      //      }
      //    ],
      //    "updateAction": "UPDATE"
      //  };
      //  var data = {
      //    "data": JSON.stringify(orionData),
      //    "ocbIP": "130.206.125.182",
      //    "ocbPort": 1026
      //  };
      //  $http.post(url, data, {
      //    timeout: 5000
      //  }).then(function successCallback(response) {
      //      alert('Succes: ' + response);
      //  },
      //  function errorCallback(response) {
      //      alert('error: ' + response);
      //  });
      //
      // };

      function detectCollisionsChange() {
        if ($scope.collisionSettings.detectCollisions) {
          collisionWatchID = robot.watchCollision(onCollision);
        } else if (collisionWatchID) {
          robot.clearWatchCollision(collisionWatchID);
          collisionWatchID = null;
        }
      }

      function onCollision(collision) {
        if (collision.type === 'wheels') {
          robot.stop();
          //robot.turnByDegrees(180);
          //alert('stop! wheels collision...');
        }
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
      var dataToUpload = [traveldata.time, traveldata.speed, traveldata.start];
      console.log(dataToUpload);
      //uploadData(dataToUpload);
    }
  }

})();
