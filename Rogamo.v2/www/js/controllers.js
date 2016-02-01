angular.module('starter.controllers', ['ionic'])

.controller('DashCtrl', function ($scope, $ionicPlatform) {
    var fakeRobot = function () {
        this.DRDriveDirection = {
            Stop: 0,
            Forward: 1,
            Backward: -1
        }

        this.kickstandsCommands = {
            up: 'retractKickstands',
            down: 'deployKickstands'
        };

        this.pole = function (command, success, fail) {
            console.log("FakeRobot.pole: " + command);
        }
        this.kickstand = function (command, success, fail) {
            console.log("FakeRobot.kickstand: " + command);
        }
        this.drive = function (command, success, fail) {
            console.log("FakeRobot.drive: " + command);
        }
        this.variableDrive = function (command, driveDirection, turn, success, fail) {
            console.log("FakeRobot.variableDrive | driveDirection:" + driveDirection);
            success({ serial: "00-00FAKE", message: "Fake Robot..." });
        }
        this.turnByDegrees = function (degrees, success, fail) {
            console.log("FakeRobot.turnByDegrees: " + degrees);
        }
    };

    var robot = new fakeRobot();
    $ionicPlatform.ready(function () {
        if (window.device && window.device.platform === 'iOS' && window.cordova && window.cordova.plugins.doubleRobotics) {
            robot = window.cordova.plugins.doubleRobotics;
        }
    });

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
        range: 3
    };

    $scope.model = model;

    var games = {
        eggThrow: "eggThrow"
    };

    $scope.games = games;

    $scope.startGame = function (game) {
        if (game === games.eggThrow) {
            console.log('starting game "eggThrow...');
            model.gameStarted = true;
            var gameInstance = new eggThrowGame();
            $scope.stopGame = gameInstance.stop;
            gameInstance.play();
        }
    }

    var eggThrowGame = function () {
        var driveCounter = 0,
            driveIntervalId,
            canvas = document.getElementById('canvas');

        var play = function () {
            clearCanvas(canvas);
            setTimeout(function () { drawSmiley(canvas, 'white') }, 1500);
            robot.kickstand(robot.kickstandsCommands.up);
            setTimeout(function () {
                robotDrive(parseFloat(model.speed), parseFloat(model.range));
            }, 3000);
        };

        var stop = function () {
            clearInterval(driveIntervalId);
            model.gameStarted = false;
            model.robotDriving = false;
            setTimeout(function () { robot.kickstand(robot.kickstandsCommands.down); }, 3000);
        };

        var onWatchAccelerationSuccess = function (acceleration) {
            $scope.$apply(function () {
                $scope.acceleration.x = acceleration.x;
                $scope.acceleration.y = acceleration.y;
                $scope.acceleration.z = acceleration.z;
                if (acceleration.z > 2) {
                    $scope.acceleration.direction = 'forward';
                    clearInterval(driveIntervalId);
                    //if (model.robotDriving) {
                        model.robotDriving = false;
                        robot.turnByDegrees(180);
                        setTimeout(function () {
                            robotDrive(parseFloat(model.speed), parseFloat(model.range));
                        }, 2000);
                    //}
                } else if (acceleration.z < -2) {
                    $scope.acceleration.direction = 'back';
                    clearInterval(driveIntervalId);
                    //if (model.robotDriving) {
                        model.robotDriving = false;
                        robot.turnByDegrees(180);
                        setTimeout(function () {
                            robotDrive(parseFloat(model.speed), parseFloat(model.range));
                        }, 2000);
                    //}
                } else {
                    $scope.acceleration.direction = 'stop';
                }
            });
        };

        var onWatchAccelerationError = function () {
            alert('Error getting accelerometer data!');
        };

        if (navigator.accelerometer) {
            var watchOptions = { frequency: 100 };
            var watchID = navigator.accelerometer.watchAcceleration(onWatchAccelerationSuccess, onWatchAccelerationError, watchOptions);
        }

        var robotDrive = function (speed, range) {
            driveCounter = 0;
            model.robotDriving = true;
            var driveSpeed = speed * 0.25;
            var turn = 0.0;
            driveIntervalId = setInterval(function () {
                if (driveCounter === 10) {
                    driveSpeed = speed * 0.5;
                }
                if (driveCounter === 20) {
                    driveSpeed = speed;
                }
                if (driveCounter === 40) {
                    driveSpeed = speed * 0.5;
                }
                if (driveCounter === 50) {
                    driveSpeed = speed * 0.25;
                }
                if (driveCounter >= 60) {
                    clearInterval(driveIntervalId);
                } else {
                    robot.variableDrive('drive', driveSpeed, turn,
                        function (data) {
                            $scope.$apply(function () {
                                $scope.doubleRobotics = data;
                            });
                        },
                        function (msg) { alert("Error! => " + msg); });
                }
                driveCounter++;
            }, 100);
        };

        this.play = play;
        this.stop = stop;
    };


    


    window.requestAnimFrame = (function (callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();

    var drawSmiley = function (canvas, color, frames, currentFrame) {
        color = color || 'black';
        frames = frames || 40;
        currentFrame = currentFrame || 0;
        currentFrame++;
        var animationProgress = (currentFrame / frames);
        var context = canvas.getContext('2d');
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = (canvas.width / 2) - 50;
        var eyeRadius = 10;
        var eyeBrowsRadius = radius * 0.25;
        var eyeXOffset = 80;
        var eyeYOffset = 20;
        var mouthRadius = radius * 0.75;
        var halfPI = Math.PI / 2;

        context.strokeStyle = color;
        // draw the yellow circle
        //context.beginPath();
        //context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        //context.fillStyle = 'yellow';
        //context.fill();
        //context.lineWidth = 5;
        //context.strokeStyle = color;
        //context.stroke();

        //// draw the eyes
        //context.beginPath();
        //var eyeX = centerX - eyeXOffset;
        //var eyeY = centerY - eyeXOffset;
        //context.arc(eyeX, eyeY, eyeRadius, 0, 2 * Math.PI, false);
        //var eyeX = centerX + eyeXOffset;
        //context.arc(eyeX, eyeY, eyeRadius, 0, 2 * Math.PI, false);
        //context.fillStyle = color;
        //context.fill();

        // draw the eyebrows
        context.beginPath();
        var eyeX = centerX - eyeXOffset,
            eyeY = centerY - eyeYOffset,
            eyeRadius = eyeBrowsRadius,
            eyeStartAngle = Math.PI * 1.25,
            eyeEndAngle = Math.PI * 1.75,
            counterClockwise = false;
        context.arc(eyeX, eyeY, eyeRadius, eyeStartAngle, eyeEndAngle, counterClockwise);
        context.lineWidth = 20;
        context.lineCap = 'round';
        context.stroke();

        context.beginPath();
        eyeX = centerX + eyeXOffset;
        context.arc(eyeX, eyeY, eyeRadius, eyeStartAngle, eyeEndAngle, counterClockwise);
        context.lineWidth = 20;
        context.lineCap = 'round';
        context.stroke();

        // draw the mouth
        context.beginPath();
        var mouthX = centerX,
            mouthY = centerY,
            mouthRadius = mouthRadius,
            mouthStartAngle = halfPI - (animationProgress * (halfPI)),
            mouthEndAngle = halfPI + (animationProgress * (halfPI)),
            counterClockwise = false;
        context.arc(mouthX, mouthY, mouthRadius, mouthStartAngle, mouthEndAngle, counterClockwise);
        context.lineWidth = 20;
        context.lineCap = 'round';
        context.stroke();

        //Rendering issue ved frame 50???
        //if (currentFrame === 50) {
        //    alert(animationProgress);
        //    return;
        //}

        if (currentFrame < frames) {
            window.requestAnimFrame(function () {
                context.clearRect(0, 0, canvas.width, canvas.height);
                drawSmiley(canvas, color, frames, currentFrame);
            });
        }
    };

    var clearCanvas = function (canvas) {
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
    //setTimeout(function () { drawSmiley(document.getElementById('canvas')) }, 3000);

})

.controller('AccCtrl', function ($scope, $ionicPlatform) {
    var fakeRobot = function () {
        this.DRDriveDirection = {
            Stop: 0,
            Forward: 1,
            Backward: -1
        }

        this.pole = function (command, success, fail) {
            console.log("FakeRobot.pole");
        }
        this.kickstand = function (command, success, fail) {
            console.log("FakeRobot.kickstand");
        }
        this.drive = function (command, success, fail) {
            console.log("FakeRobot.drive");
        }
        this.variableDrive = function (command, driveDirection, turn, success, fail) {
            console.log("FakeRobot.variableDrive");
            success({ serial: "00-00FAKE", message: "Fake Robot..." });
        }
        this.turnByDegrees = function (degrees, success, fail) {
            console.log("FakeRobot.turnByDegrees");
        }
    };

    var robot = new fakeRobot();
    $ionicPlatform.ready(function () {
        if (window.device && window.device.platform === 'iOS' && window.cordova && window.cordova.plugins.doubleRobotics) {
            robot = window.cordova.plugins.doubleRobotics;
        }
    });


    $scope.acceleration = {
        x: 0,
        y: 0,
        z: 0,
        direction: 'stop'
    };
        
    //if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
    //    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    //}

    $scope.retractKickstands = function () {
        robot.kickstand("retractKickstands");
    }

    $scope.deployKickstands = function () {
        robot.kickstand("deployKickstands");
    }

    $scope.turnByDegrees = function (degrees) {
        robot.drive("turnByDegrees", function (msg) { alert("Succes! => " + msg); }, function (msg) { alert("Error! => " + msg); });
    }


    $scope.driveForward = function () {
        var counter = 0;
        var driveSpeed = 0.25;
        var turn = 0.0;
        var intervalId = setInterval(function () {
            if (counter === 10) {
                driveSpeed = 0.5
                turn = 0.25;
            }
            if (counter === 20) {
                driveSpeed = 1.0
            }
            if (counter === 40) {
                driveSpeed = 0.5
            }
            if (counter === 50) {
                driveSpeed = 0.25
                turn = 0.0;
            }
            if (counter >= 60) {
                clearInterval(intervalId);
            } else {
                robot.variableDrive('drive', driveSpeed, turn,
                    function (data) {
                        $scope.doubleRobotics = data;
                    },
                    function (msg) { alert("Error! => " + msg); });
            }
            counter++;
        }, 100);
    };

    $scope.driveBackward = function () {
        var counter = 0;
        var intervalId = setInterval(function () {
            if (counter >= 20) {
                clearInterval(intervalId);
            } else {
                robot.drive('drive', -0.5);
                counter++;
            }
        }, 100);
    };

    //alert($ionicPlatform);
    if (navigator.accelerometer) {
        function onSuccess(acceleration) {
            $scope.$apply(function () {
                $scope.acceleration.x = acceleration.x;
                $scope.acceleration.y = acceleration.y;
                $scope.acceleration.z = acceleration.z;
                if (acceleration.z > 2) {
                    $scope.acceleration.direction = 'forward';
                } else if (acceleration.z < -2) {
                    $scope.acceleration.direction = 'back';
                } else {
                    $scope.acceleration.direction = 'stop';
                }
            });
            //console.log('Acceleration X: ' + acceleration.x + '\n' +
            //      'Acceleration Y: ' + acceleration.y + '\n' +
            //      'Acceleration Z: ' + acceleration.z + '\n' +
            //      'Timestamp: ' + acceleration.timestamp + '\n');
        }

        function onError() {
            alert('Error getting accelerometer data!');
        }

        var options = { frequency: 500 };

        var watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);

    }

})

.controller('ControlsCtrl', function ($scope, $ionicPlatform, formatFilter) {
    var fakeRobot = function () {
        this.DRDriveDirection = {
            Stop: 0,
            Forward: 1,
            Backward: -1
        }

        this.pole = function (command, success, fail) {
            console.log("FakeRobot.pole");
        }
        this.kickstand = function (command, success, fail) {
            console.log("FakeRobot.kickstand");
        }
        this.drive = function (command, success, fail) {
            console.log("FakeRobot.drive");
        }
        this.variableDrive = function (command, driveDirection, turn, success, fail) {
            console.log("FakeRobot.variableDrive");
            success({ serial: "00-00FAKE", message: "Fake Robot..." });
        }
        this.turnByDegrees = function (degrees, success, fail) {
            console.log("FakeRobot.turnByDegrees");
        }
    };

    var robot = new fakeRobot();
    $ionicPlatform.ready(function () {
        if (window.device && window.device.platform === 'iOS' && window.cordova && window.cordova.plugins.doubleRobotics) {
            robot = window.cordova.plugins.doubleRobotics;
        }
    });

    $scope.doubleRobotics = {
        serial: "00-000000",
        message: ""
    }

    $scope.model = {
        degrees: null,
        speed: 0.5
    }

    $scope.kickstandsCommands = {
        up: 'retractKickstands',
        down: 'deployKickstands'
    };

    $scope.poleCommands = {
        up: 'poleUp',
        down: 'poleDown',
        stop: 'poleStop'
    };

    $scope.kickstands = function (direction) {
        robot.kickstand(direction);
    }

    $scope.pole = function (direction) {
        robot.pole(direction);
    }

    $scope.turnByDegrees = function (degrees) {
        robot.turnByDegrees(degrees)//, function (data) { alert("Succes! => " + data.message); }, function (data) { alert("Error! => " + data.message); });
    }

    $scope.drive = function (direction, turn) {
        robot.variableDrive('drive', direction, turn,
            function (data) {
                $scope.doubleRobotics = data;
            },
            function (msg) { alert("Error! => " + msg); }
        );
    };

});
