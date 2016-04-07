(function () {
    'use strict';

    angular.module('app.core')
    .factory('RobotEngine', RobotEngine);

    RobotEngine.$inject = ['$cordovaRobot' ,'$q'];

    function RobotEngine(robot, $q) {
      var robot = robot,
          collisionListeners = [],
          accelerometerWatchID = null,
          collisionDetectionSuspended = false,
          collisionDelayInMs = 1000;

      var robotEngine = {
          drive: robot.drive,
          stop: robot.stop,
          turnByDegrees: robot.turnByDegrees,
          poleDown: robot.poleDown,
          poleStop: robot.poleStop,
          poleUp: robot.poleUp,
          retractKickstands: robot.retractKickstands,
          deployKickstands: robot.deployKickstands,
          watchTravelData: watchTravelData,
          clearWatchTravelData: clearWatchTravelData,
          watchCollision: watchCollision,
          clearWatchCollision: clearWatchCollision,
          getCompassHeading: _getCompassHeading
      };
      return robotEngine;

      function watchTravelData(listener) {
        robot.watchTravelData(listener);
      }

      function clearWatchTravelData(listener) {
        robot.clearWatchTravelData(listener);
      }

      function watchCollision(listener) {
        var id = null;
        if (typeof listener === "function") {
          id = _createGuid();
          console.log('watchCollision... id: ' + id);
          collisionListeners.push({id: id, listener: listener});
          // If we just registered the first collision handler, make sure native listeners are started for robot + accelerometer:
          if (collisionListeners.length === 1) {
            robot.watchCollision(_onRobotCollision);
            //var wid = listener.observer_guid;
            if (accelerometerWatchID === null) {
              //accelerometerWatchID = _startWatchAcceleration();
            }
          }
        }
        return id;
      }

      function clearWatchCollision(id) {
        var listener = _removeListener(collisionListeners, id);
        if (listener) {
          robot.clearWatchCollision(listener);
        }
        if (collisionListeners.length === 0) {
            _stopWatchAcceleration();
        }
      }

      function _removeListener(listeners, id) {
        for (var idx = 0, length = listeners.length; idx < length; idx++) {
          if (listeners[idx].id === id) {
            return listeners.splice(idx, 1)[0].listener;
          }
        }
      }

      function _dispatchEvent(listeners, eventData) {
        var tempListeners = listeners.slice(0);
        for (var i = 0, length = tempListeners.length; i < length; i++) {
            tempListeners[i].listener(eventData);
        }
      }

      function _onRobotCollision(collisionDetails) {
        if (!collisionDetectionSuspended) {
          collisionDetectionSuspended = true;
          _dispatchEvent(collisionListeners, collisionDetails);
          setTimeout(function() {
            collisionDetectionSuspended = false;
          }, collisionDelayInMs)
        }
      }

      function _startWatchAcceleration() {
        var options = { frequency: 100 };
        if (navigator.accelerometer) {
          //setTimeout(function() {
            console.log('Start watching acceleration...');
            var watchID = navigator.accelerometer.watchAcceleration(_onAccelerometerSuccess, _onAccelerometerError, options);
            return watchID;
          //}, 0);
        }
      }

      function _stopWatchAcceleration() {
        if (navigator.accelerometer && accelerometerWatchID) {
          console.log('Stop watching acceleration...');
          navigator.accelerometer.clearWatch(accelerometerWatchID);
          accelerometerWatchID = null;
        }
      }

      function _onAccelerometerSuccess(acceleration) {
        var minAcceleration = 2;
        if (!collisionDetectionSuspended) {
          if (Math.abs(acceleration.userAccelerationZ) >= minAcceleration) {
                collisionDetectionSuspended = true;
                var collisionDetails = {
                  type: 'tablet',
                  direction: acceleration.userAccelerationZ > 0 ? 'forward' : 'back',
                  force: acceleration.userAccelerationZ
                };
                _dispatchEvent(collisionListeners, collisionDetails);
                setTimeout(function() {
                  collisionDetectionSuspended = false;
                }, collisionDelayInMs)
          }
        }
      }

      function _onAccelerometerError(acceleration) {

      }

      function _getCompassHeading(compassSuccess, compassError) {
        var deferred;
        if (compassSuccess === undefined) {
          console.log('_getCompassHeading => use Promises.');
          deferred = $q.defer();
          compassSuccess = function(heading) {
            deferred.resolve(heading);
          }
          compassError = function(error) {
            deferred.reject(error);
          }
        }
        if (navigator.compass) {
          navigator.compass.getCurrentHeading(compassSuccess, compassError);
        } else {
          compassError({code: 0, text: 'compass not supported'});
        }
        if (deferred) {
          return deferred.promise;
        }
      }

      function _createGuid()
      {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
        });
      }
    };

})();
