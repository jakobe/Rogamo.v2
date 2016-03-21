(function () {
    'use strict';

    angular.module('app')
    .controller('EggThrowGameController', EggThrowGameController);

    EggThrowGameController.$inject = ['$scope', '$ionicPlatform', 'CanvasRendererService', 'EggThrowGame'];

    function EggThrowGameController($scope, $ionicPlatform, CanvasRendererService, EggThrowGame) {

        var vm = this;

        $scope.doubleRobotics = {
            serial: "00-000000",
            message: "-"
        }

        $scope.acceleration = {
            x: 0,
            y: 0,
            z: 0,
            direction: 'stop'
        };

        var model = {
            gameStarted: false,
            robotDriving: false,
            speed: 0.5,
            degrees: 0,
            range: 2.0,
            minForce: 2.0,
            maxForce: 8.0,
            robotData: {
                serial: "xx"
            }
        };

        $scope.model = model;

        var games = {
            eggThrow: "eggThrow"
        };

        $scope.games = games;


        $scope.startGame = function (game) {
            var currentGame = null;
            if (game === games.eggThrow) {
                currentGame = EggThrowGame;
            }
            if (currentGame != null) {
                console.log('starting game "' + game + '"...');
                currentGame.init($scope.model, onTravelData, onRobotDriveFailure, onGameOver, onRobotPush);
                $scope.stopGame = currentGame.stop;
                CanvasRendererService.clearCanvas(canvas);
                //setTimeout(function () { CanvasRendererService.drawSmiley(canvas, 'white') }, 1500);
                $scope.model.gameLost = false;
                var gameContainer = document.getElementById('gameContainer');
                gameContainer.style.backgroundColor = "rgb(185, 175, 157)";
                gameContainer.setAttribute("data-background-color-init", gameContainer.style.backgroundColor);
                currentGame.play();
                model.gameStarted = true;
            }
        };

        function onTravelData(data) {
            // $scope.$apply(function () {
            //     $scope.model.robotData = angular.extend($scope.model.robotData, data);
            // });
        }

        function onRobotDriveFailure(data) {
            //TODO
        }

        function onRobotPush(collisionData) {
            //alert('data.acceleration.z: ' + data.acceleration.z);
            console.log(collisionData);
            $scope.$apply(function () {
                $scope.collision = collisionData;
                model.nextCollision = 1.0;
            });
            var intervalId = setInterval(function() {
              $scope.$apply(function () {
                if (model.nextCollision <= 0.1) {
                  clearInterval(intervalId);
                } else {
                  model.nextCollision -= 0.1;
                }
              });
            }, 100)
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
                //alert('�v, du har smadret �gget :(');
            }
        }

        //setTimeout(function () { CanvasRendererService.drawSmiley(document.getElementById('canvas'), '#fff') }, 100);

    };


})();
