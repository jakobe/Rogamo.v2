(function () {
  'use strict';

  angular.module('app.core')
  .factory('GameEngine', GameEngine);

  GameEngine.$inject = ['RobotStatus', 'OrionService', '$q'];

  function GameEngine(robotStatus, orionService, $q) {
    var gameEngine = {
      logGameStats: logGameStats
    };

    return gameEngine;

    function logGameStats(gameId, startDate, endDate, winner) {
      var durationInMs = endDate - startDate;
      var durationToTime = _msToTime(durationInMs);
      var duration = Number((durationToTime.minutes + (durationToTime.seconds / 60.0)).toFixed(1));
      var promises = {
        robotSerial: robotStatus.getSerial(),
        position: robotStatus.getGeolocation()
      }
      $q.all(promises).then(function(values) {
        if (values.robotSerial) {
          if (values.position) {
            orionService.uploadGameData(values.robotSerial, values.position, gameId, startDate, duration);
          } else {
            alert('Kunne ikke få GPS position.\nCheck at GPS/lokationstjenester er slået til.');
          }
        } else {
          alert('Robot er ikke forbundet til iPad\'en.\nCheck at bluetooth er slået til og robotten er tændt.');
        }
      });
    }

    function _msToTime(duration) {
        var milliseconds = parseInt((duration % 1000)),
            seconds = parseInt((duration / 1000) % 60),
            minutes = parseInt((duration / (1000 * 60)) % 60),
            hours = parseInt((duration / (1000 * 60 * 60)) % 24);

        var hoursString = (hours < 10) ? "0" + hours : hours;
        var minutesString = (minutes < 10) ? "0" + minutes : minutes;
        var secondsString = (seconds < 10) ? "0" + seconds : seconds;
        var millisecondsString = (milliseconds < 100) ? "0" + milliseconds : milliseconds;

        return {
          time: hoursString + ":" + minutesString + ":" + secondsString + "." + millisecondsString,
          hours : hours,
          minutes : minutes,
          seconds : seconds,
          milliseconds : milliseconds
        };
    }
  }

})();
