(function () {
    'use strict';

    angular.module('app.core')
    .factory('html5Audio', Html5Audio);

    function Html5Audio() {

      return {
          // id -> obj mapping
          res_cache: {},

          preloadSimple: function(id, assetPath, success, fail) {
              var res = new Audio();
              res.addEventListener('canplaythrough', success, false);
              res.onerror = fail;
              res.setAttribute('src', assetPath);
              res.load();
              this.res_cache[ id ] = res;
          },

          preloadComplex: function(id, assetPath, volume, voices, delay, success, fail) {
              var res = new Audio();
              res.addEventListener('canplaythrough', success, false);
              res.onerror = fail;
              res.setAttribute('src', assetPath);
              res.load();
              res.volume = volume;
              this.res_cache[ id ] = res;
          },

          play: function(id, success, fail, complete) {
              var res = this.res_cache[ id ];
              if(typeof res === 'object') {
                  if(typeof complete === "function") {
                    res.addEventListener('ended', complete, false);
                  }
                  res.play();
                  if(typeof success === 'function') success();
              } else {
                  if(typeof fail === 'function') fail();
              }
          },

          mute: function(ismute, success, fail) {
              for(id in this.res_cache) {
                  var res = this.res_cache[ id ];
                  if(typeof res === 'object') res.muted = ismute;
              }
              if(typeof success === 'function') success();
          },

          loop: function(id, success, fail) {
              var res = this.res_cache[ id ];
              if(typeof res === 'object') {
                  res.loop = true;
                  res.play();
                  if(typeof success === 'function') success();
              } else {
                  if(typeof fail === 'function') fail();
              }
         },
          stop: function(id, success, fail) {
              var res = this.res_cache[ id ];
              if(typeof res === 'object') {
                  res.pause();
                  //if (res.currentTime) res.currentTime = 0;
                  if(typeof success === 'function') success();
              } else {
                  if(typeof fail === 'function') fail();
              }
          },
          unload: function(id, success, fail) {
              var res = this.res_cache[ id ];
              if(typeof res === 'object') {
                  delete this.res_cache[ id ];
                  if(typeof success === 'function') success();
              } else {
                  if(typeof fail === 'function') fail();
              }
          }
      };
    }

})();
