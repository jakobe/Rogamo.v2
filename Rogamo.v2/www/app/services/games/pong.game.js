(function () {
    'use strict';

    angular.module('app.core')
    .factory('PongGame', PongGame);

    PongGame.$inject = ['RobotEngine', 'audioService'];

    function PongGame(robot, audioService) {
      var settings,
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
              { id: 'gameover', path: 'audio/82248__robinhood76__01299-smashing-egg-1.wav' },
              { id: 'cheering', path: 'audio/pong/bernie_cheeringcrowd_337000__corsica-s__cheer-01.wav' },
          ],
          playerSounds = [
            { id: 'Asta', path: 'audio/pong/players/asta2.mp3' },
            { id: 'Erik', path: 'audio/pong/players/erik3.mp3' },
            { id: 'Helle', path: 'audio/pong/players/helle3.mp3' },
            { id: 'Tove', path: 'audio/pong/players/tove3.mp3' },
          ],
          soundAndImageFiles = [
              //{ id: 'ID', path: 'audio/pong/', imagePath: 'img/pong/' },
              { id: 'accordion', path: 'audio/pong/accordion_looperman-l-1564425-0090033-rasputin1963-accordion-brisk-polka.mp3', imagePath: 'img/pong/accordion_PolkaBob2.jpg' },
              { id: 'actors', path: 'audio/pong/actors_166434__ultradust__concert-applause-1.mp3', imagePath: 'img/pong/actors.jpg' },
              { id: 'bus', path: 'audio/pong/bus_178402__genel__honk2.mp3', imagePath: 'img/pong/bus_robert82-outback-coach-1460516-1280x960.jpg' },
              { id: 'clarinet', path: 'audio/pong/clarinet_looperman-l-0747210-0094261-ferryterry-145-bpm-clarinet.mp3', imagePath: 'img/pong/clarinet.jpg' },
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
          timeoutID,
          robotDriving = false,
          startHeading = 0,
          players = [];

      _preloadSounds();

      // setTimeout(function testSound() {
      //   //audioService.play('violin');
      //   _playAudioVisual();
      // }, 1000);

      var game = {
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
        robot.getCompassHeading(function setStartHeading(heading) {
          startHeading = heading.magneticHeading;
        });
        robot.retractKickstands();
        document.getElementById('pongOutput').style.display = gameSettings.debug ? 'block' : 'none';
      }

      function play() {
        audioService.loop(backgroundSound.id);
        robot.watchTravelData(_onTraveldata);
        collisionWatchID = robot.watchCollision(_onCollision);
        _startDrive();
      }

      function stop() {
          robotDriving = false;
          robot.stop();
          robot.clearWatchTravelData(_onTraveldata);
          robot.clearWatchCollision(collisionWatchID);
          clearTimeout(timeoutID);
          audioService.stop(backgroundSound.id);
          // setTimeout(function () {
          //   robot.deployKickstands();
          // }, 2000);
      }

      /////////////////////

      function _startDrive() {
        var randomTurn = _getRandomArbitrary(-settings.maxTurn, settings.maxTurn);
        console.log('randomTurn: ' + randomTurn);
        robotDriving = true;
        _handleEvent(events.startDrive);
        robot.drive(settings.maxSpeed, randomTurn, settings.maxOuterRangeInCm, _onDriveEnd);
        document.getElementById('pongOutput').innerHTML = 'drive: ' + settings.maxSpeed + ', rangeInCm: ' + (settings.maxOuterRangeInCm) + '<br/>turn: ' + randomTurn;
      }

      function _onDriveEnd() {
        audioService.play('gameover');
        stop();
        _handleEvent(events.gameOver, false);
      }

      function _onCollision(collision) {
        console.log('Collision...');
        document.getElementById('pongOutput').innerHTML += '<br/>Collision! Type: ' + collision.type + ' - Robot Driving: ' + robotDriving;

        //if (collision.type === 'tablet' && Math.abs(collision.force) > maxForce) {
        if (collision.type === 'wheels' && robotDriving) {
          robotDriving = false;
          robot.getCompassHeading(_onCompassHeading);
          _handleEvent(events.robotPush, collision);
          robot.stop();
          audioService.play('ding');
          timeoutID = setTimeout(function() {
            var randomDegrees = _getRandomInt(settings.minRotationInDegrees, 180);
            if (_getRandomInt(0, 1) === 0) {
              randomDegrees = -randomDegrees;
            }
            console.log('drive back: ' + (-settings.maxSpeed) + ', rangeInCm: ' + (settings.pushRangeInCm));
            document.getElementById('pongOutput').innerHTML = 'drive back: ' + (-settings.maxSpeed) + ', rangeInCm: ' + (settings.pushRangeInCm) + '<br/>Then turnByDegrees: ' + randomDegrees;
            _playAudioVisual();
            robot.drive(-settings.maxSpeed, 0.0, (settings.pushRangeInCm), function(traveldata) {
              //audioService.play('success');
              console.log('turnByDegrees: ' + randomDegrees);
              document.getElementById('pongOutput').innerHTML = 'Drive back done.<br/>Now turnByDegrees: ' + randomDegrees;
              robot.turnByDegrees(randomDegrees);
              timeoutID = setTimeout(function() {
                //audioService.play('success');
                _startDrive();
              }, 3000);
            });
          }, settings.pushWaitInMs);
        }
      }

      function _onCompassHeading(heading) {
        var sliceSize = 360 / settings.numberOfPlayers;
        var relativeHeading = (heading.magneticHeading - startHeading + 360) % 360;
        var playerAngle = (relativeHeading + (sliceSize / 2)) % 360;
        var facingPlayerNo = Math.floor(playerAngle / sliceSize);
        console.log('sliceSize: ' + sliceSize + ', relativeHeading: ' + relativeHeading + ', playerAngle: ' + playerAngle + ', facingPlayerNo: ' + facingPlayerNo);
        var currentPlayer = players[facingPlayerNo];
        currentPlayer.points++;
        console.log('Playing sound: ' + currentPlayer.successSoundId);
        setTimeout(function() {
          audioService.play(currentPlayer.successSoundId);
        }, 500);

        document.getElementById('pongOutput').innerHTML += '<br/><br/>Start heading: ' + startHeading;
        document.getElementById('pongOutput').innerHTML += '<br/>Heading: ' + heading.magneticHeading;
        document.getElementById('pongOutput').innerHTML += '<br/>relativeHeading: ' + relativeHeading;
        document.getElementById('pongOutput').innerHTML += '<br/>playerAngle: ' + playerAngle;
        document.getElementById('pongOutput').innerHTML += '<br/><br/>Facing player no:';
        document.getElementById('pongOutput').innerHTML += '<div style="font-size: 150px; margin-top: 50px;">' + (facingPlayerNo+1) + '</div>';
        document.getElementById('pongOutput').innerHTML += '<br/><br/>Points: ' + currentPlayer.points;

        if (currentPlayer.points >= totalPointsToWin) {
          stop();
          _handleEvent(events.showImage, 'img/pong/Transparent_Gold_Cup_Trophy_PNG_Picture.png');
          setTimeout(function() {
            audioService.play('cheering');
            _handleEvent(events.gameOver, true, currentPlayer);
          }, 1000);
        }

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

      function _playAudioVisual() {
        var soundAndImage = _selectRandomSoundAndImage();
        console.log('Playing/showing: ' + soundAndImage.id);
        audioService.play(soundAndImage.id);
        _handleEvent(events.showImage, soundAndImage.imagePath);
      }

      function _onTraveldata(traveldata) {
        //console.log('range: ' + traveldata.range + ', maxOuterRangeInCm: ' + settings.maxOuterRangeInCm);
        //   if (traveldata.range >= settings.maxOuterRangeInCm) {
        //     stop();
        //   }
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
        var allSounds = soundFiles.concat(soundAndImageFiles, playerSounds);
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
    };

})();
