(function () {
  'use strict';

  angular.module('app.core')
  .factory('OrionService', OrionService);

  OrionService.$inject = ['RobotEngine', '$http', '$q'];

  function OrionService(robot, $http, $q) {
    var isNewRobot = null;
    var orionService = {
      query: queryOrionContextBroker,
      uploadRobotData: uploadRobotData,
      uploadGameData: uploadGameData
    };

    return orionService;

    function queryOrionContextBroker(query) {
      var url = 'http://195.225.105.124/orion/server/crossDomainOrionCB.php';//'http://130.206.125.182:1026/v1/updateContext';
      var data = {
        "data": JSON.stringify(query),
        "ocbIP": "130.206.118.99",
        "ocbPort": 1026
      };
      return $http.post(url, data, { timeout: 5000 });
    }

    function uploadRobotData(robotSerial, position, dataToUpload) {
      var entityType = "robot";
      dataToUpload.geolocation = [
        position.coords.latitude,
        position.coords.longitude
      ];
      var query = _getOrionUpdateQuery(entityType, robotSerial, dataToUpload);
      if (isNewRobot === null) {
        _checkIfRobotExistsInOrionContextBroker(robotSerial).then(function successCallback(isNew) {
          if (isNew != null) {
            isNewRobot = isNew;
            query = _getOrionUpdateQuery(entityType, robotSerial, dataToUpload, isNew);
            _uploadData(query, robotSerial);
          }
        }, function errorCallback(error) {
          console.log('Error: ' + error);
        });
      } else {
        _uploadData(query, robotSerial);
      }
    }

    function uploadGameData(robotSerial, position, gameId, startDate, duration) {
      var entityType = "game";
      var UID = "UID" + startDate.getTime();
      var dataToUpload = {
        gameID: gameId,
        robotID: robotSerial,
        timeStamp: startDate.toJSON(),
        duration: duration,
        geolocation: [
          position.coords.latitude,
          position.coords.longitude
        ]
      }
      var isNew = true;
      var query = _getOrionUpdateQuery(entityType, UID, dataToUpload, isNew);
      //console.log(JSON.stringify(query));
      _uploadGameData(query, UID);
    }

    ////////////////////////////////

    function _uploadData(query, robotSerial) {
      queryOrionContextBroker(query).then(function successCallback(response) {
        console.log('Robot status logged to Rogamo Dashboard for robot id: ' + robotSerial);
      },
      function errorCallback(response) {
        console.log('error: ' + JSON.stringify(response));
      });
    }

    function _uploadGameData(query, uid) {
      queryOrionContextBroker(query).then(function successCallback(response) {
        console.log('Game data logged to Rogamo Dashboard for UID: ' + uid);
      },
      function errorCallback(response) {
        console.log('error: ' + JSON.stringify(response));
      });
    }


    function _getOrionUpdateQuery(type, id, data, isNew) {
      var updateAction = isNew ? "APPEND" : "UPDATE";
      var dataToUpload = _convertDataToOrionFormat(data);

      var query = {
        "contextElements": [
          {
            "type": type,
            "isPattern": "false",
            "id": id,
            "attributes": dataToUpload
          }
        ],
        "updateAction": updateAction
      };
      return query;
    }

    function _convertDataToOrionFormat(data) {
      var dataToUpload = [];
      for (var prop in data) {
        if (data.hasOwnProperty(prop)) {
          var name = prop,
              value = data[prop],
              entry = {
                "name": name,
                "type": _parseDataType(value),
                value: value
              };
          dataToUpload.push(entry);
        }
      }
      return dataToUpload;
    }

    function _parseDataType(value) {
      var dataType = typeof value;//"";
      switch (typeof value) {
        case "number":
          dataType = (value % 1 === 0)
                    ? "integer"
                    : "float";
          break;
        case "object":
          if (value instanceof Array) {
            dataType = "array";
          }
          break;
        default:

      }
      return dataType;
    }

    function _checkIfRobotExistsInOrionContextBroker(robotSerial) {
      var deferred = $q.defer();

      if (robotSerial) {
        var query = {
          "entities" : [
            {
              "type" : "robot",
              "isPattern" : "false",
              "id" : robotSerial
            }
          ]
        };
        queryOrionContextBroker(query).then(function successCallback(response) {
          var isNew = null;
          if (response.data) {
            if (response.data.contextResponses instanceof Array) {
              var contextResponse = response.data.contextResponses[0];
              var element = contextResponse.contextElement;
              isNew = robotSerial != element.id;
            } else if (response.data.errorCode && response.data.errorCode.code == "404") {
              isNew = true;
            }
          }
          deferred.resolve(isNew);
        }, deferred.reject);
      } else {
        deferred.reject("Robot Serial unknown.");
      }
      return deferred.promise;
    }
  }

})();
