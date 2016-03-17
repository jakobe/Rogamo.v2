(function () {
    'use strict';

    angular.module('app.core')
    .factory('RobotEngine', RobotEngine);

    RobotEngine.$inject = ['$cordovaRobot'];

    function RobotEngine(robot) {
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
          watchCollision: watchCollision,
          clearWatchCollision: clearWatchCollision
      };
      return robotEngine;

      function watchCollision(listener) {
        //robot.watchCollision(listener);
        //var wid = listener.observer_guid;
        var id = _createGuid();
        console.log('watchCollision... id: ' + id);
        collisionListeners.push({id: id, listener: listener});
        if (accelerometerWatchID === null) {
          accelerometerWatchID = _startWatchAcceleration();
        }
        return id;
      }

      function clearWatchCollision(id) {
        var listener = _removeListener(collisionListeners, id);
        debugger;
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
        //accel = new Acceleration(a.x, a.y, a.z, a.userAccelerationX, a.userAccelerationY, a.userAccelerationZ, a.rotationX, a.rotationY, a.rotationZ, a.yaw, a.pitch, a.roll, a.timestamp);
        for (var i = 0, length = tempListeners.length; i < length; i++) {
            tempListeners[i].listener(eventData);
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
        if (!collisionDetectionSuspended) {
          var minAcceleration = 2;
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

      function _createGuid()
      {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
        });
      }
    };

})();
