(function () {
    'use strict';

    angular.module('app.core')
    .factory('PongGame', PongGame);

    PongGame.$inject = ['RobotEngine', 'audioService', '$q', '$timeout'];

    function PongGame(robot, audioService, $q, $timeout) {
      var isInitialized = false,
          settings,
          totalPointsToWin = 5,
          handlers = {},
          events = {
            travelData: "travelData",
            showImage: "showImage",
            startDrive: "startDrive",
            driveFailure: "driveFailure",
            gameOver: "gameOver",
            robotPush: "robotPush"
          },
          collisionWatchID,
          backgroundSound = { id: 'background', path: 'audio/pong/268079__rbnx__birds-spring-mono-02.mp3' },
          soundFiles = [
              { id: 'success', path: 'audio/109663__grunz__success_low.wav' },
              { id: 'ding', path: 'audio/Speech On.wav' },
              { id: 'gameover', path: 'audio/pong/fail_106727__kantouth__CARTOON_BING_LOW.wav' },
              { id: 'cheering', path: 'audio/pong/actors_166434__ultradust__concert-applause-1.mp3' },// 'audio/pong/bernie_cheeringcrowd_337000__corsica-s__cheer-01.wav' },
          ],
          playerSounds = [
            { id: 'Asta', path: 'audio/pong/players/Asta p.mp3' },
            { id: 'Erik', path: 'audio/pong/players/Erik p.mp3' },
            { id: 'Helle', path: 'audio/pong/players/Helle p.mp3' },
            { id: 'Tove', path: 'audio/pong/players/tove p.mp3' },
          ],
          pointSounds = [
            { id: '1point', path: 'audio/pong/points/1p.mp3' },
            { id: '2point', path: 'audio/pong/points/2p.mp3' },
            { id: '3point', path: 'audio/pong/points/3p.mp3' },
            { id: '4point', path: 'audio/pong/points/4p.mp3' },
            { id: '5point', path: 'audio/pong/points/5p.mp3' },
          ],
          questionSounds = [
            { id: 'question1', path: 'audio/pong/questions/qbørn.mp3' },
            { id: 'question2', path: 'audio/pong/questions/qefternavn.mp3' },
            { id: 'question3', path: 'audio/pong/questions/qfar.mp3' },
            { id: 'question4', path: 'audio/pong/questions/qfødt.mp3' },
            { id: 'question5', path: 'audio/pong/questions/qidræt.mp3' },
            { id: 'question6', path: 'audio/pong/questions/qlakrids.mp3' },
            { id: 'question7', path: 'audio/pong/questions/qmor.mp3' },
            { id: 'question8', path: 'audio/pong/questions/qmorgenmad.mp3' },
            { id: 'question9', path: 'audio/pong/questions/qmusik.mp3' },
            { id: 'question10', path: 'audio/pong/questions/qskole.mp3' },
            { id: 'question11', path: 'audio/pong/questions/qsøskende.mp3' },
            { id: 'question12', path: 'audio/pong/questions/qyndlingsfarve.mp3' },
          ],
          soundAndImageFiles = [
              //{ id: 'ID', path: 'audio/pong/', imagePath: 'img/pong/' },
              { id: 'accordion', path: 'audio/pong/accordion_looperman-l-1564425-0090033-rasputin1963-accordion-brisk-polka.mp3', imagePath: 'img/pong/accordion_PolkaBob2.jpg' },
              //{ id: 'actors', path: 'audio/pong/actors_166434__ultradust__concert-applause-1.mp3', imagePath: 'img/pong/actors.jpg' },
              { id: 'bus', path: 'audio/pong/bus_178402__genel__honk2.mp3', imagePath: 'img/pong/bus_robert82-outback-coach-1460516-1280x960.jpg' },
              { id: 'clarinet', path: 'audio/pong/clarinet_looperman-l-0747210-0094261-ferryterry-145-bpm-clarinet_shorter.mp3', imagePath: 'img/pong/clarinet.jpg' },
              { id: 'clown', path: 'audio/pong/clown_151827__corsica-s__circus-freak.mp3', imagePath: 'img/pong/clown-2-1482827.jpg' },
              { id: 'drums', path: 'audio/pong/drums_looperman-l-1414881-0085534-epicrecord-jazz-kit-calm-and-steady.mp3', imagePath: 'img/pong/drums-11505.jpg' },
              { id: 'flute', path: 'audio/pong/flute_looperman-l-0731079-0053337-oscarkesh-classical-flute-130bpm.mp3', imagePath: 'img/pong/flute-post-11004-0-24348900-1385696337.jpg' },
              { id: 'goat', path: 'audio/pong/goat_273911__beskhu__goat.mp3', imagePath: 'img/pong/goat.jpg' },
              { id: 'bluesguitar', path: 'audio/pong/bluesguitar_looperman-l-1828748-0094511-zincchameleon-rockabilly-position-pull-in-a.mp3', imagePath: 'img/pong/bluesguitar_Blues_Guitar_Solo2.jpg' },
              { id: 'jazzguitar', path: 'audio/pong/guitar_looperman-l-0747210-0092501-ferryterry-120-bpm-rhytmic-guitar.mp3', imagePath: 'img/pong/guitar-fender-dave-murray-stratocaster.jpg' },
              { id: 'harp', path: 'audio/pong/bluesharp_looperman-l-0987154-0083960-baltesa-harp-groove.mp3', imagePath: 'img/pong/bluesharp-Blues Harp 532-20-a-2.jpg' },
              { id: 'organ', path: 'audio/pong/organ_looperman-l-1564425-0093502-rasputin1963-what-to-say.mp3', imagePath: 'img/pong/organ-2011-10-26_004025_dsc01491.jpg' },
              { id: 'piano', path: 'audio/pong/piano walk.mp3', imagePath: 'img/pong/piano-cat-1404179-1280x960.jpg' },
              { id: 'saxophone', path: 'audio/pong/sax_looperman-l-0067443-0040015-slapjohnson-funktastic-baritone-sax-08.mp3', imagePath: 'img/pong/sax-B-602CL-zoom.png' },
              { id: 'telephone', path: 'audio/pong/telephone_stationOpenTelephone.mp3', imagePath: 'img/pong/telephone_oma-s-old-telephone-1424523-1280x960.jpg' },
              { id: 'trumpet', path: 'audio/pong/trumpet_bugle_music_reveille_short.mp3', imagePath: 'img/pong/trumpet_brass-1172038-1279x553.jpg' },
              { id: 'ukulele', path: 'audio/pong/ukulele_looperman-l-1441718-0080855-dandyrecord-ukulele-love.mp3', imagePath: 'img/pong/ukulele_1327609797897.cached.png' },
              { id: 'violin', path: 'audio/pong/violin_92002__jcveliz__violin-origional.mp3', imagePath: 'img/pong/violin-2-1420085.jpg' },
              { id: 'wedding', path: 'audio/pong/wedding_40847__mattew__wedding-bells.mp3', imagePath: 'img/pong/wedding-1430073-639x852.jpg' },
              { id: 'xylophone', path: 'audio/pong/xylophone_looperman-l-0141223-0026917-nepaul-xylophone-loop.mp3', imagePath: 'img/pong/xylophone.gif' },
          ],
          soundAndImageFilesRandomQueue = [],
          lastPlayedSoundAndImage,
          soundsPlaying = {},
          timeoutPromise,
          robotDriving = false,
          startHeading = 0,
          players = [],
          debugOutput = document.getElementById('pongOutput');

      _preloadSounds();

      // setTimeout(function testSound() {
      //   //audioService.play('violin');
      //   _playAudioVisual();
      // }, 1000);

      var game = {
          id: "Pong",
          init: init,
          play: play,
          stop: stop
      };
      return game;

      //////////////////////

      function init(gameSettings, showImageHandler, startDriveHandler, gameOverHandler, robotPushHandler, failureHandler) {
        settings = gameSettings;
        totalPointsToWin = settings.totalPointsToWin || totalPointsToWin;
        handlers = {
          showImage: showImageHandler,
          startDrive: startDriveHandler,
          driveFailure: failureHandler,
          gameOver: gameOverHandler,
          robotPush: robotPushHandler
        }
        players = new Array(settings.numberOfPlayers);
        for (var i = 0; i < settings.numberOfPlayers; i++) {
          var successSoundId = i < playerSounds.length ? playerSounds[i].id : 'ding';
          var playerName = i < playerSounds.length ? playerSounds[i].id : 'Spiller nr. ' + (i+1);
          players[i] = {
            name: playerName,
            successSoundId: successSoundId,
            points: 0
          };
        }
        if (!isInitialized && settings.enablePointerDetection) {
          _addPointerDetectionWindows(settings.inputVideo);
        }
        robot.getCompassHeading().then(_setStartHeading);
        robot.retractKickstands();
        debugOutput.style.display = settings.debug ? 'block' : 'none';
        isInitialized = true;
      }

      function play() {
        audioService.loop(backgroundSound.id);
        collisionWatchID = robot.watchCollision(_onCollision);
        _randomRotate(-180, 180).then(_startDrive);
      }

      function stop() {
          robotDriving = false;
          robot.stop();
          robot.clearWatchCollision(collisionWatchID);
          $timeout.cancel(timeoutPromise);
          _stopAllSounds();
          //$timeout(robot.deployKickstands, 2000);
      }

      /////////////////////

      function _setStartHeading(heading) {
        startHeading = heading.magneticHeading;
      }

      function _startDrive() {
        var randomTurn = _getRandomArbitrary(-settings.maxTurn, settings.maxTurn);
        console.log('randomTurn: ' + randomTurn);
        robotDriving = true;
        _handleEvent(events.startDrive);
        robot.drive(settings.maxSpeed, randomTurn, settings.maxOuterRangeInCm, _onDriveEnd);
        _debug('drive: ' + settings.maxSpeed + ', rangeInCm: ' + (settings.maxOuterRangeInCm) + '<br/>turn: ' + randomTurn);
      }

      function _onDriveEnd() {
        audioService.play('gameover');
        stop();
        _handleEvent(events.gameOver, false);
      }

      function _gameOver(winner) {
        stop();
        _driveAway().then(function() {
          _handleEvent(events.showImage, 'img/pong/Transparent_Gold_Cup_Trophy_PNG_Picture.png');
          audioService.play('cheering');
          robot.drive(0, 1);
          timeoutPromise = $timeout(function(){
            robot.stop();
          }, 11000);
          _handleEvent(events.gameOver, true, winner);
        });
      }

      function _onCollision(collision) {
        console.log('Collision...');
        _debugAppend('<br/>Collision! Type: ' + collision.type + ' - Robot Driving: ' + robotDriving);

        //if (collision.type === 'tablet' && Math.abs(collision.force) > maxForce) {
        if (collision.type === 'wheels' && robotDriving) {
          robotDriving = false;
          robot.stop();
          robot.getCompassHeading().then(_getPlayerFromOrientation).then(function(player) {
            if (settings.enablePointerDetection) {
              var wait = timeoutPromise = $timeout(1000);
              wait.then(_driveAway).then(_randomRotate).then(_startDrive);
            } else {
              _handlePushFromPlayer(player);
            }
          })
          if (!settings.enablePointerDetection) {
            _handleEvent(events.robotPush, collision);
          }
          audioService.play('ding');
        }
      }

      function _handlePushFromPlayer(currentPlayer) {
        currentPlayer.points++;
        _debugAppend('<br/><br/>Points: ' + currentPlayer.points);
        var announceWait = timeoutPromise = $timeout(function() {
          return currentPlayer;
        }, 500);
        announceWait.then(_playPlayerName).then(_playCurrentPoints).then(function() {
          if (currentPlayer.points >= totalPointsToWin) {
            _gameOver(currentPlayer);
            return;
          }
          var questionWait = timeoutPromise = $timeout(function() {
            return currentPlayer;
          }, 1000);
          questionWait.then(_playQuestion).then(function() {
            return timeoutPromise = $timeout(settings.pushWaitInMs);
          }).then(function() {
            _playAudioVisual();
            _driveAway().then(_randomRotate).then(_startDrive);
          });
        });
      }

      function _randomRotate(min, max) {
        var deferred = $q.defer();
        var randomDegrees = (isNaN(min) || isNaN(max))
                            ? _getRandomAngleInDegrees()
                            : _getRandomInt(min, max);
        console.log('turnByDegrees: ' + randomDegrees);
        _debugAppend('<br/>Now turnByDegrees: ' + randomDegrees);
        robot.turnByDegrees(randomDegrees);
        var rotateWait = timeoutPromise = $timeout(3000);
        rotateWait.then(function() {
          //audioService.play('success');
          _debugAppend('Rotate done.');
          deferred.resolve();
        });
        return deferred.promise;
      }

      function _getRandomAngleInDegrees() {
        var randomDegrees = _getRandomInt(settings.minRotationInDegrees, 180);
        if (_getRandomInt(0, 1) === 0) {
          randomDegrees = -randomDegrees;
        }
        return randomDegrees;
      }

      function _driveAway() {
        var deferred = $q.defer();
        console.log('drive back: ' + (-settings.maxSpeed) + ', rangeInCm: ' + (settings.pushRangeInCm));
        _debug('drive back: ' + (-settings.maxSpeed) + ', rangeInCm: ' + (settings.pushRangeInCm));
        robot.drive(-settings.maxSpeed, 0.0, settings.pushRangeInCm, function(traveldata) {
          //audioService.play('success');
          _debug('Drive back done.');
          _debugAppend('<br/><br/>Range: ' + traveldata.range);
          deferred.resolve();
        });
        return deferred.promise;
      }

      function _getPlayerFromOrientation(compassHeading) {
        var sliceSize = 360 / settings.numberOfPlayers;
        var relativeHeading = (compassHeading.magneticHeading - startHeading + 360) % 360;
        var playerAngle = (relativeHeading + (sliceSize / 2)) % 360;
        var facingPlayerNo = Math.floor(playerAngle / sliceSize);
        console.log('sliceSize: ' + sliceSize + ', relativeHeading: ' + relativeHeading + ', playerAngle: ' + playerAngle + ', facingPlayerNo: ' + facingPlayerNo);
        var currentPlayer = players[facingPlayerNo];

        _debugAppend('<br/><br/>Start heading: ' + startHeading);
        _debugAppend('<br/>Heading: ' + compassHeading.magneticHeading);
        _debugAppend('<br/>relativeHeading: ' + relativeHeading);
        _debugAppend('<br/>playerAngle: ' + playerAngle);
        _debugAppend('<br/><br/>Facing player no:');
        _debugAppend('<div style="font-size: 150px; margin-top: 50px;">' + (facingPlayerNo+1) + '</div>');

        return currentPlayer;
      }

      function _playSound(soundId) {
        var deferred = $q.defer();
        soundsPlaying[soundId] = soundId;
        audioService.play(soundId, null, null, function() {
          delete soundsPlaying[soundId];
          deferred.resolve();
        });
        return deferred.promise;
      }


      function _stopAllSounds() {
        audioService.stop(backgroundSound.id);
        for(var key in soundsPlaying) {
            var soundId = soundsPlaying[key];
            console.log('Stopping sound: ' + soundId);
            audioService.stop(soundId,
              function success() {},
              function error(msg) {
                console.log('Error stopping sound: ' + msg); }
            );
            delete soundsPlaying[key];
        }
      }

      function _playPlayerName(player) {
        var deferred = $q.defer();
        _playSound(player.successSoundId).then(function() {
          deferred.resolve(player);
        });
        return deferred.promise;
      }

      function _playCurrentPoints(player) {
        var deferred = $q.defer();
        var pointSound = pointSounds.length >= player.points
                         ? pointSounds[player.points - 1]
                         : null;
        if (pointSound) {
          _playSound(pointSound.id).then(function() {
            deferred.resolve(player);
          });
        } else {
          deferred.resolve(player);
        }
        return deferred.promise;
      }

      function _playQuestion(player) {
        var deferred = $q.defer();
        var randomQuestion = _selectRandomQuestion(player);
        console.log('Playing question: ' + randomQuestion.id);
        _playSound(randomQuestion.id).then(function() {
          deferred.resolve(player);
        });
        return deferred.promise;
      }

      function _selectRandomQuestion(player) {
        var questionQueue = player.questionsRandomQueue;
        if (questionQueue === undefined || questionQueue.length === 0) {
          questionQueue = player.questionsRandomQueue = questionSounds.slice();
          _shuffleArray(questionQueue);
          //Make sure last played sound and image is not the same as the next:
          if (player.lastPlayedQuestion != undefined && player.lastPlayedQuestion === questionQueue[questionQueue.length - 1]) {
            questionQueue.unshift(questionQueue.pop());
          }
        }
        return player.lastPlayedQuestion = questionQueue.pop();
      }

      function _playAudioVisual() {
        var soundAndImage = _selectRandomSoundAndImage();
        console.log('Playing/showing: ' + soundAndImage.id);
        audioService.play(soundAndImage.id);
        _handleEvent(events.showImage, soundAndImage.imagePath);
      }

      function _selectRandomSoundAndImage() {
        if (soundAndImageFilesRandomQueue.length === 0) {
          console.log('Copy original array...');
          soundAndImageFilesRandomQueue = soundAndImageFiles.slice();
          console.log('Shuffle copied array...');
          _shuffleArray(soundAndImageFilesRandomQueue);
          //Make sure last played sound and image is not the same as the next:
          if (lastPlayedSoundAndImage != undefined && lastPlayedSoundAndImage === soundAndImageFilesRandomQueue[soundAndImageFilesRandomQueue.length - 1]) {
            console.log('Last played sound and image is the same as the next - move to beginning of array...');
            soundAndImageFilesRandomQueue.unshift(soundAndImageFilesRandomQueue.pop());
          }
        }
        return lastPlayedSoundAndImage = soundAndImageFilesRandomQueue.pop();
      }

      function _shuffleArray(array) {
        var m = array.length, t, i;
        // While there remain elements to shuffle…
        while (m) {
          // Pick a remaining element…
          i = Math.floor(Math.random() * m--);
          // And swap it with the current element.
          t = array[m];
          array[m] = array[i];
          array[i] = t;
        }
        return array;
      }

      function _handleEvent(eventName) {
        var handler = handlers[eventName];
        if (handler && typeof handler === "function") {
          var newArguments = [].slice.call(arguments, 1);
          handler.apply(handler, newArguments);
        }
      }

      function _getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
      }

      function _getRandomInt(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function _preloadSounds() {
        var allSounds = soundFiles.concat(soundAndImageFiles, playerSounds, pointSounds, questionSounds);
        for (var i = 0, length = allSounds.length; i < length; i++) {
            var sound = allSounds[i];
            audioService.preloadSimple(sound.id, sound.path);
        }
        var backgroundSoundVolume = 0.5,
            backgroundSoundVoices = 1.0,
            backgroundSoundDelay = 0.0;
        audioService.preloadComplex(backgroundSound.id, backgroundSound.path, backgroundSoundVolume, backgroundSoundVoices, backgroundSoundDelay,
            function (msg) {},
            function (msg) {
                console.log('Error loading complex sound: ' + msg);
        });
      }

      function _addPointerDetectionWindows(inputVideo) {
        var videoWidth = inputVideo.videoWidth,
        videoHeight = inputVideo.videoHeight;

        var padding = 50,
        windowWidth = videoWidth - (padding * 2),
        windowHeight = Math.round(videoHeight * 0.6) - (padding * 2);

        var upperWindow = {
          id: 'upper',
          width: windowWidth,
          height: windowHeight,
          upperRightX: padding,
          upperRightY: padding
        };

        var lowerWindow = {
          id: 'lower',
          width: windowWidth,
          height: windowHeight,
          upperRightX: padding,
          upperRightY: padding + windowHeight
        };
        robot.addPointerDetectionWindows(upperWindow, windowIn, windowOut);
      }

      function windowIn(data) {
        if (settings.enablePointerDetection) {
          switch (data.windowId) {
            case "upper":
            console.log('Pointer Detected...');
            _debugAppend('<br/>Pointer Detected - Robot Driving: ' + robotDriving);
            if (robotDriving) {
              robotDriving = false;
              robot.stop();
              robot.getCompassHeading().then(_getPlayerFromOrientation).then(_handlePushFromPlayer);
              audioService.play('ding');
              _handleEvent(events.robotPush, collision);
            }
            break;
          }
        }
      };

      function windowOut(data) {
        console.log("WindowOut event detected in window " + data.windowId);
      };

      function _debug(message, append) {
        if (settings.debug) {
          if (append) {
            message = debugOutput.innerHTML + message;
          }
          debugOutput.innerHTML = message;
        }
      }

      function _debugAppend(message) {
        _debug(message, true);
      }
    };

})();
