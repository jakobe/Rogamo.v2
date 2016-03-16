(function () {
    'use strict';

    angular.module('app.core')
    .factory('audioService', AudioService);

    AudioService.$inject = ['$window', 'html5Audio'];

    function AudioService($window, html5Audio) {
        return ($window.device && ($window.device.platform === 'iOS' || $window.device.platform === 'Android') && $window.plugins && $window.plugins.NativeAudio)
            ? $window.plugins.NativeAudio
            : html5Audio;
    }

})();
