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

        var service = {
            drawSmiley: drawSmiley
        };
        return service;

        /////////////////////////



        function drawSmiley(canvas, color, frames, currentFrame) {
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


    }

})();