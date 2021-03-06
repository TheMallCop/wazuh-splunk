
/*
 * Wazuh app - Top nav bar directive
 * Copyright (C) 2018 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
define(['../module'], function (directives) {
  'use strict'
  directives.directive('wzMenu', function (BASE_URL) {
    return {
      controller: function ($scope, $currentDataService, $navigationService) {
        $scope.logoUrl = BASE_URL + '/static/app/SplunkAppForWazuh/css/images/wazuh/png/wazuh_white_full.png'
        const update = () => {
          $scope.currentIndex = (!$currentDataService.getIndex()) ? 'wazuh' : $currentDataService.getIndex().index
          $scope.currentAPI = (!$currentDataService.getApi()) ? '---' : $currentDataService.getApi().managerName
          $scope.theresAPI = ($scope.currentAPI === '---') ? false : true
          if ($navigationService.getLastState() && $navigationService.getLastState() !== '' && $navigationService.getLastState().includes('ow-') || $navigationService.getLastState().includes('overview')) {
            $scope.menuNavItem = 'overview'
            if (!$scope.$$phase) $scope.$digest()
          }
          else if ($navigationService.getLastState() && $navigationService.getLastState() !== '' && $navigationService.getLastState().includes('mg-') || $navigationService.getLastState().includes('manager')) {
            $scope.menuNavItem = 'manager'
            if (!$scope.$$phase) $scope.$digest()
          }
          else if ($navigationService.getLastState() && $navigationService.getLastState() !== '' && $navigationService.getLastState().includes('ag-') || $navigationService.getLastState().includes('agents')) {
            $scope.menuNavItem = 'agents'
            if (!$scope.$$phase) $scope.$digest()
          }
          else if ($navigationService.getLastState() && $navigationService.getLastState() !== '' && $navigationService.getLastState().includes('api.') || $navigationService.getLastState().includes('settings')) {
            $scope.menuNavItem = 'settings'
            if (!$scope.$$phase) $scope.$digest()
          }
          else if ($navigationService.getLastState() && $navigationService.getLastState() !== '' && $navigationService.getLastState().includes('dev-tools')) {
            $scope.menuNavItem = 'dev-tools'
            if (!$scope.$$phase) $scope.$digest()
          }
        }
        // Listens for changes in the selected API
        $scope.$on('updatedAPI', () => {
          update()
        })
        $scope.$on('stateChanged', () => {
          update()
        })
        update()
      },
      templateUrl: BASE_URL + '/static/app/SplunkAppForWazuh/js/directives/wz-menu/wz-menu.html'
    }
  })
})