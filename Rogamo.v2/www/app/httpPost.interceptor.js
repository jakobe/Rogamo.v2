(function () {
    'use strict';

    angular.module('app')
    .factory('httpPostInterceptor', HttpPostInterceptor);

    function HttpPostInterceptor() {
      var interceptor = {
        request: function(config) {
            if (config.method === "POST" && config.url.indexOf('.php') > -1) {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
            config.transformRequest = function(obj) {
              var str = [];
              for(var p in obj)
              str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
              return str.join("&");
            };
            //debugger;
          }
          return config;
        }
      };

      return interceptor;

    }
  })();
