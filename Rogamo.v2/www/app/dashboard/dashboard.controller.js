(function () {
    'use strict';

    angular.module('app')
    .controller('DashboardController', DashboardController);
    
    DashboardController.$inject = ['$scope'];

    function DashboardController($scope) {

        var vm = this;
    };


})();
