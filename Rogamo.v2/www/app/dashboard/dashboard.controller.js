(function () {
  'use strict';

  angular.module('app')
  .controller('DashboardController', DashboardController);

  DashboardController.$inject = ['$scope', 'RobotStatus'];

  function DashboardController($scope, robotStatus) {

    var vm = this;

  };


})();
