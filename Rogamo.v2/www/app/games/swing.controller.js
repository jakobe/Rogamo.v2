(function () {
    'use strict';

    angular.module('app')
    .controller('SwingGameController', SwingGameController);

    SwingGameController.$inject = ['$scope', '$ionicPlatform', 'CanvasRendererService', 'SwingGame', 'GameEngine'];

    function SwingGameController($scope, $ionicPlatform, CanvasRendererService, game, gameEngine) {
        var vm = this,
            startDate;

        $scope.doubleRobotics = {
            serial: "00-000000",
            message: "-"
        }

        var model = {
            gameStarted: false,
            robotDriving: false,
            speed: 1,
            lowSpeedFactor: 0.5,
            mediumSpeedFactor: 0.75,
            degrees: 0,
            range: 2.5,
            rangeLowDelta: 1.0,
            rangeMediumDelta: 0.5,
            swingduration: 4.0,
            swingbackpause: 1,
            numberOfPlayers: 2,
            robotData: {
                serial: "xx"
            }
        };

        $scope.model = model;

        $scope.startGame = function () {
          startDate = new Date();
          console.log('starting game "' + game.id + '"...');
          game.init($scope.model, onRobotDriveSucces, onRobotDriveFailure, onGameOver, onRobotPush);
          CanvasRendererService.clearCanvas(canvas);
          //setTimeout(function () { CanvasRendererService.drawSmiley(canvas, 'white') }, 1500);
          $scope.model.gameLost = false;
          var gameContainer = document.getElementById('gameContainer');
          gameContainer.style.backgroundColor = "rgb(255, 255, 255)";
          gameContainer.setAttribute("data-background-color-init", gameContainer.style.backgroundColor);
          game.play();
          model.gameStarted = true;
        };

        $scope.stopGame = function() {
          game.stop();
          if (startDate instanceof Date) {
            var endDate = new Date();
            var winner = null;
            gameEngine.logGameStats(game.id, startDate, endDate, winner);
          }
        }

        $scope.push = function (force) {
            $scope.force = force;
            game.pushSwing(force);
        }

        function onRobotDriveSucces(traveldata) {
            $scope.$apply(function () {
                $scope.model.robotData = angular.extend($scope.model.robotData, traveldata);
            });
        }

        function onRobotDriveFailure(data) {
            //TODO
        }

        function onRobotPush(data) {
            $scope.$apply(function () {

            });
        }

        function onGameOver(success, data) {
            if (success) {
                setTimeout(function () { CanvasRendererService.drawSmiley(canvas, 'white') }, 100);
                alert('Tillykke, du har vundet :)');
            } else {
                $scope.$apply(function () {
                    $scope.model.gameLost = true;
                });
                var gameContainer = document.getElementById('gameContainer');
                gameContainer.setAttribute("data-background-color-init", gameContainer.style.backgroundColor);
                gameContainer.style.backgroundColor = "red";
                //alert('Øv, du har smadret ægget :(');
            }
        }

        //setTimeout(function () { CanvasRendererService.drawSmiley(document.getElementById('canvas'), '#fff') }, 100);

    };


})();
