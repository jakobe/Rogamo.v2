(function () {
  'use strict';

  angular.module('app')
  .controller('DashboardController', DashboardController);

  DashboardController.$inject = ['$scope', '$ionicPlatform'];

  function DashboardController($scope, $ionicPlatform) {

    var vm = this;

    // setTimeout(function () {
    //   console.log('loading kurento-pointer.controller.js...');
    //   var head= document.getElementsByTagName('head')[0];
    //   var script= document.createElement('script');
    //   script.type= 'text/javascript';
    //   script.src= 'app/kurento/kurento-pointer.controller.js';
    //   head.appendChild(script);
    //   console.log('kurento-pointer.controller.js loaded');
    // }, 5000);


    $ionicPlatform.ready().then(function () {
      if (window.device.platform === 'iOS') {
        cordova.plugins.iosrtc.registerGlobals();
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia === undefined) {
        alert('No support for navigator.mediaDevices.getUserMedia!');
      } else {
        //setTimeout(startVideo, 5000);
      }
    });

    function startVideo() {

      // Prefer camera resolution nearest to 1280x720.
      var constraints = { audio: false, video: { width: 1280, height: 720 } };

      navigator.mediaDevices.getUserMedia(constraints)
      .then(function(stream) {
        var video = document.querySelector('video');
        //debugger;
        video.src = window.URL.createObjectURL(stream);
        video.onloadedmetadata = function(e) {
          video.play();
        };
      })
      .catch(function(err) {
        console.log(err.name + ": " + err.message);
      });
    }

  };


})();
