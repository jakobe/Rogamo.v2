(function () {
  'use strict';

  angular.module('app.core')
  .factory('PointerDetection', PointerDetection);

  PointerDetection.$inject = [];

  function PointerDetection() {
    console.log('New PointerDetection service instantiated...');
    kurentoClient.register('kurento-module-pointerdetector');
    var listeners = [],
    //videoInput = document.getElementById('videoInput'),
    //videoOutput = document.getElementById('videoOutput'),
    PointerDetectorWindowMediaParam = kurentoClient.register.complexTypes.PointerDetectorWindowMediaParam,
    WindowParam = kurentoClient.register.complexTypes.WindowParam;

    var pointerDetection = {
      init: init
    };
    return pointerDetection;

    ///////////////////////////

    function init(options) {
      var listener = {
        settings: options
      };
      listener.start = start.bind(listener);
      listener.pause = pause.bind(listener);
      listener.resume = resume.bind(listener);
      listener.stop = stop.bind(listener);
      listener.calibrate = calibrate.bind(listener),
      listener.addWindows = _addPointerDetectorWindows.bind(listener);
      listeners.push(listener);
      return listener;
    }

    function start(options) {
      var listener = this,
          defaults = {
            videoWidth: 640,
            videoFrameRate: 15,
            videoInput: null,
            videoOutput: null,
            sendVideoOnly: false
          };
      options = angular.extend({}, defaults, options);
      console.log("WebRTC loopback starting");

      showSpinner(options.videoInput);
      if (!options.sendVideoOnly) {
        showSpinner(options.videoOutput);
      }

      var promise = new Promise(function(resolve, reject) {
        var webRtcOptions = _getWebRtcOptions(listener, options);

        var webRtcPeerFunc = options.sendVideoOnly
        ? kurentoUtils.WebRtcPeer.WebRtcPeerSendonly
        : kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv;

        webRtcPeerFunc(webRtcOptions, function (error) {
          if (error) {
            reject(error);
            return onError(error);
          }
          var webRtcPeer = listener.webRtcPeer = this;
          this.generateOffer(function(error, sdpOffer) {
            onOffer(error, sdpOffer, listener, resolve);
          });
        });
      });
      return promise;
    }

    function stop() {
      if (this.pipeline) {
        this.pipeline.release();
        this.pipeline = null;
      }
      if (this.client) {
        this.client.close();
      }
      if (this.webRtcPeer) {
        if (this.webRtcPeer.localVideo) {
          hideSpinner(this.webRtcPeer.localVideo);
        }
        if (this.webRtcPeer.remoteVideo) {
          hideSpinner(this.webRtcPeer.remoteVideo);
        }
        this.webRtcPeer.dispose();
        this.webRtcPeer = null;
      }
    }

    function pause() {
      var listener = this;

      if (listener.webRtcPeer) {
        toggleStream(listener.webRtcPeer.getLocalStream(), false);
        toggleStream(listener.webRtcPeer.getRemoteStream(), false);
        hideSpinner(listener.webRtcPeer.localVideo, listener.webRtcPeer.remoteVideo);
      }
    }

    function resume() {
      var listener = this;
      if (listener.webRtcPeer) {
        var localVideo = listener.webRtcPeer.localVideo;
        var remoteVideo = listener.webRtcPeer.remoteVideo;
        showSpinner(localVideo, remoteVideo);
        toggleStream(listener.webRtcPeer.getLocalStream(), true);
        toggleStream(listener.webRtcPeer.getRemoteStream(), true);
        if (localVideo && localVideo.hasAttribute('data-video-src')) {
          localVideo.src = localVideo.getAttribute('data-video-src');
        }
        if (remoteVideo && remoteVideo.hasAttribute('data-video-src')) {
          remoteVideo.src = remoteVideo.getAttribute('data-video-src');
        }
      }
    }

    function toggleStream(stream, enabled)  {
      if (stream && stream.getAudioTracks) {
        stream.getAudioTracks().forEach(function(track) {
          track.enabled = enabled;
        });
      }
      if (stream && stream.getVideoTracks) {
        stream.getVideoTracks().forEach(function(track) {
          track.enabled = enabled;
        });
      }
    }

    function calibrate() {
      if (this.filter) this.filter.trackColorFromCalibrationRegion(onError);
    }

    function onError(error) {
      if (error) console.error(error);
    }

    function showSpinner() {
      for (var i = 0; i < arguments.length; i++) {
        var video = arguments[i];
        if (video && video instanceof HTMLVideoElement) {
          if (video.hasAttribute("poster")) {
            video.setAttribute("data-poster-init", video.getAttribute("poster"));
            video.poster = 'img/transparent-1px.png';
          }
          video.style.background = "center transparent url('img/spinner.gif') no-repeat";
        }
      }
    }

    function hideSpinner() {
      for (var i = 0; i < arguments.length; i++) {
        var video = arguments[i];
        if (video && video instanceof HTMLVideoElement) {
          if (video.src != '') {
            video.setAttribute('data-video-src', video.src);
          }
          video.src = '';
          if (video.hasAttribute("data-poster-init")) {
            video.poster = video.getAttribute("data-poster-init");
            delete video["data-poster-init"];
          }
          video.style.background = '';
        }
      }
    }


    function _getWebRtcOptions(listener, options) {
      var webRtcOptions =
      {
        localVideo: options.videoInput,
        remoteVideo: options.videoOutput,
        mediaConstraints: {
          audio: false,
          video: {
            width: parseInt(options.videoWidth),
            framerate: parseInt(options.videoFrameRate)
          }
        }
      };

      var ice_servers = listener.settings.connectionSettings.ice_servers;

      if (ice_servers) {
        console.log("Use ICE servers: " + ice_servers);
        webRtcOptions.configuration = {
          iceServers: JSON.parse(ice_servers)
        };
      } else {
        console.log("Use freeice")
      }
      return webRtcOptions;
    }

    function onOffer(error, sdpOffer, listener, onConnected) {
      if (error) return onError(error);

      console.log("onOffer");

      _createClient(listener.settings.connectionSettings.ws_uri)
      .then(function onClientCreated(client) {
        return listener.client = client;
      }, onError)
      .then(_createMediaPipeline, onError)
      .then(function onClientCreated(pipeline) {
        console.log("Got MediaPipeline");
        return listener.pipeline = pipeline;
      }, onError)
      .then(_createWebRtcEndpoint, onError)
      .then(function onWebRtcEndpointCreated(webRtcEndPoint) {
        console.log("Got WebRtcEndpoint");
        return listener.webRtcEndPoint = webRtcEndPoint;
      }, onError)
      .then(function(webRtcEndPoint) {
        _setIceCandidateCallbacks(listener.webRtcPeer, webRtcEndPoint, sdpOffer);
        return _createPointerDetectorFilter(listener.pipeline);
      }, onError)
      .then(function onClientCreated(filter) {
        console.log("Got PointerDetectorFilter");
        return listener.filter = filter;
      }, onError)
      //.then(_addPointerDetectorWindows, onError)
      .then(function() {
        return _connectClient(listener);
      }, onError)
      .then(onConnected, onError);
    }

    function _createClient(ws_uri) {
      return kurentoClient(ws_uri);
    }

    function _createMediaPipeline(client) {
      return client.create('MediaPipeline');
    }

    function _createWebRtcEndpoint(pipeline) {
      return pipeline.create('WebRtcEndpoint');
    }

    function _setIceCandidateCallbacks(webRtcPeer, webRtcEndPoint, sdpOffer) {
      webRtcPeer.on('icecandidate', function (candidate) {
        console.log("Local candidate:", candidate);

        candidate = kurentoClient.register.complexTypes.IceCandidate(candidate);

        webRtcEndPoint.addIceCandidate(candidate, onError)
      });

      webRtcEndPoint.on('OnIceCandidate', function (event) {
        var candidate = event.candidate;

        console.log("Remote candidate:", candidate);

        webRtcPeer.addIceCandidate(candidate, onError);
      });

      webRtcEndPoint.processOffer(sdpOffer, function (error, sdpAnswer) {
        if (error) return onError(error);

        console.log("SDP answer obtained. Processing ...");

        webRtcEndPoint.gatherCandidates(onError);
        webRtcPeer.processAnswer(sdpAnswer);
      });

    }

    function _createPointerDetectorFilter(pipeline) {
      var calibrateWidth = 30,
      options = {
        calibrationRegion: WindowParam({
          topRightCornerX: 0,
          topRightCornerY: 0,
          width: calibrateWidth,
          height: calibrateWidth
        })
      };

      return pipeline.create('PointerDetectorFilter', options);
    }

    function _addPointerDetectorWindows(windows, onWindowIn, onWindowOut) {
      if (this.filter) {
        var filter = this.filter;
        if (!(windows instanceof Array)) {
          windows = [windows];
        }
        for (var i = 0; i < windows.length; i++) {
          var _window = windows[i];
          var windowOptions = PointerDetectorWindowMediaParam({
            id: _window.id,
            height: _window.height,
            width: _window.width,
            upperRightX: _window.upperRightX,
            upperRightY: _window.upperRightY
          });
          filter.addWindow(windowOptions).then(null, onError);
        }
        if (typeof onWindowIn === "function")
          filter.on('WindowIn', onWindowIn);
        if (typeof onWindowOut === "function")
          filter.on('WindowOut', onWindowOut);
      }
    }

    function _connectClient(listener) {
      console.log("Connecting ...");
      var promise = new Promise(function(resolve, reject) {
        listener.client.connect(listener.webRtcEndPoint, listener.filter, listener.webRtcEndPoint, function (error) {
          if (error) {
            reject(error);
            return onError(error);
          }
          //document.getElementById('inputDimensions').innerText = "INPUT VIDEO - w: " + videoInput.videoWidth + ", h: " + videoInput.videoHeight;
          //setTimeout(function () { document.getElementById('outputDimensions').innerText = "OUTPUT VIDEO - w: " + videoOutput.videoWidth + ", h: " + videoOutput.videoHeight; }, 2000);
          console.log("WebRtcEndpoint --> Filter --> WebRtcEndpoint");
          // if (_webRtcPeer && _webRtcPeer.remoteVideo) {
          //   _webRtcPeer.remoteVideo.oncanplay = function() {
          //     debugger;
          //   };
          // };
          var videoInput = listener.webRtcPeer.localVideo;
          var videoOutput = listener.webRtcPeer.remoteVideo;
          listener.input = {
            videoWidth: videoInput.videoWidth,
            videoHeight: videoInput.videoHeight
          };
          listener.output = {
            videoWidth: videoOutput ? videoOutput.videoWidth : 0,
            videoHeight: videoOutput ? videoOutput.videoHeight : 0
          };
          resolve(listener);
        });
      });
      return promise;
    }

    function _createGuid()
    {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    }

  }

})();
