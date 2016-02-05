(function () {
    'use strict';

    angular.module('app.core')
    .factory('CanvasRendererService', CanvasRendererService);

    window.requestAnimFrame = (function (callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();

    function CanvasRendererService() {

        var expressions = {
            happy: {
                mouth: {
                    startingPoint: Math.PI / 2,
                    startAngle: Math.PI / 2,
                    endAngle: Math.PI / 2
                },
                eyebrows: {
                    startAngle: -45,
                    endAngle: 45
                }
            }
        };

        var defaults = {
            color: '#fff',
            animate: true,
            frames: 40,
            expression: expressions.happy
        };


        var service = {
            drawSmiley: drawSmiley,
            clearCanvas: clearCanvas
        };
        return service;

        /////////////////////////

        function drawSmiley(canvas, options) {
            var settings = angular.extend({}, defaults, options),
                frames = settings.animate ? settings.frames : 1;
            animateSmiley(canvas, settings.expression, settings.color, frames);
        }

        function animateSmiley(canvas, expression, color, frames, currentFrame) {
            color = color || 'black';
            frames = frames || 40;
            currentFrame = currentFrame || 0;
            currentFrame++;
            var mouth = expression.mouth;
            var eyebrows = expression.eyebrows;
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
                eyeStartAngle = degreesToRadians(eyebrows.startAngle-90),
                eyeEndAngle = degreesToRadians(eyebrows.endAngle-90),
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
                mouthStartAngle = mouth.startingPoint - (animationProgress * (mouth.startAngle)),
                mouthEndAngle = mouth.startingPoint + (animationProgress * (mouth.endAngle)),
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
                    animateSmiley(canvas, expression, color, frames, currentFrame);
                });
            }
        };

        function degreesToRadians(degrees) {
            return degrees * (Math.PI / 180);
        }

        function radiansToDegrees(radians) {
            return radians * (180 / Math.PI);
        }

        function clearCanvas(canvas) {
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
        };


    }

})();