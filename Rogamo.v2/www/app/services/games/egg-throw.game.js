(function () {
    'use strict';

    angular.module('app.core')
    .factory('EggThrowGame', EggThrowGame);

    EggThrowGame.$inject = ['RobotEngine', 'audioService'];

    function EggThrowGame(robot, audioService) {
        var model = null,
            handlers = {},
            events = {
              travelData: "travelData",
              driveFailure: "driveFailure",
              gameOver: "gameOver",
              robotPush: "robotPush"
            },
            points = 0,
            totalPointsToWin = 5,
            direction = 1,
            driveTimeoutID,
            collisionWatchID,
            minForce = 0.0,
            maxForce = 0.0,
            soundFiles = [
                { id: 'success', path: 'audio/109663__grunz__success_low.wav' },
                { id: 'gameover', path: 'audio/82248__robinhood76__01299-smashing-egg-1.wav' }
            ];

        preloadSounds();

        var game = {
            id: "EggThrow",
            init: init,
            play: play,
            stop: stop
        };
        return game;

        function init(modelX, travelDataHandler, failureHandler, gameOverHandler, robotPushHandler) {
          console.log('Init...');
            model = modelX;
            handlers = {
              travelData: travelDataHandler,
              driveFailure: failureHandler,
              gameOver: gameOverHandler,
              robotPush: robotPushHandler
            }
            minForce = parseFloat(model.minForce),
            maxForce = parseFloat(model.maxForce)
        }

        function _handleEvent(eventName) {
          var handler = handlers[eventName];
          if (handler && typeof handler === "function") {
            var newArguments = [].slice.call(arguments, 1);
            handler.apply(handler, newArguments);
          }
        }

        function play() {
            console.log('Play...');
            points = 0;
            collisionWatchID = robot.watchCollision(onCollision);
            robot.retractKickstands();
            driveTimeoutID = setTimeout(function () {
                model.gameStarted = true;
                robotStartDrive(parseFloat(model.speed), parseFloat(model.range) * 100);
            }, 3000);
        };

        function stop() {
            robot.stop();
            model.gameStarted = false;
            clearWatchCollision();
            clearTimeout(driveTimeoutID);
            //setTimeout(function () { robot.deployKickstands(); }, 500);
        };

        function clearWatchCollision() {
          if (collisionWatchID) {
            robot.clearWatchCollision(collisionWatchID);
            collisionWatchID = null;
          }
        }

        function onCollision(collision) {
          console.log('Collision...');
          _handleEvent(events.robotPush, collision);
          if (collision.type === 'tablet' && Math.abs(collision.force) > maxForce) {
              robot.stop();
              clearWatchCollision();
              audioService.play('gameover');
              _handleEvent(events.gameOver, false, {});
          } else if (collision.type === 'wheels' || (collision.type === 'tablet' && Math.abs(collision.force) > minForce)) {
              points++;
              robot.stop();
              audioService.play('success');

              var gameContainer = document.getElementById('gameContainer');
              gameContainer.setAttribute("data-background-color-init", gameContainer.style.backgroundColor);
              gameContainer.style.backgroundColor = "green";
              if (points >= totalPointsToWin) {
                  //Game won!
                  //stop();
                  clearWatchCollision();
                  _handleEvent(events.gameOver, true, {});
              } else {
                  setTimeout(function () {
                      gameContainer.style.backgroundColor = gameContainer.getAttribute("data-background-color-init");
                  }, 1000);
                  direction = -direction;

                  if (parseFloat(model.degrees) != 0) {
                      robot.turnByDegrees(parseFloat(model.degrees));
                  }
                  console.log('Drive opposite in 0,5 seconds...');
                  driveTimeoutID = setTimeout(function () {
                      robotStartDrive(parseFloat(model.speed) * direction, parseFloat(model.range) * 100);
                  }, 500);
              }
          }
        }

        function robotStartDrive(speed, rangeInCm) {
          var turn = 0.0;
            if (model.gameStarted) {
                model.robotDriving = true;
                console.log('Robot.drive => speed: ' + speed + ', rangeInCm: ' + rangeInCm);
                robot.drive(speed, turn, rangeInCm);
            } else {
              console.log('Game ended...');
            }
        };

        function preloadSounds() {
          for (var i = 0, length = soundFiles.length; i < length; i++) {
              var sound = soundFiles[i];
              audioService.preloadSimple(sound.id, sound.path);
          }
        }

    };

})();
