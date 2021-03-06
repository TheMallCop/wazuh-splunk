/*
 * Wazuh app - Wazuh table directive
 * Copyright (C) 2018 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

// import template from './wz-table.html';
// import { uiModules } from 'ui/modules';
// import DataFactory from '../../services/data-factory';

// const app = uiModules.get('app/wazuh', []);

define(['../module', 'underscore'], function (directives, _) {
  'use strict'
  directives.directive('wazuhTable', function ($dataService, $notificationService, BASE_URL) {
    return {
      restrict: 'E',
      scope: {
        path: '=path',
        keys: '=keys',
        allow: '=allow',
        implicitFilter: '=implicitFilter',
        rowsPerPage: '=rowsPerPage',
        extraLimit: '=extraLimit'
      },
      controller: function ($scope, $timeout, $tableFilterService, $state, $keyEquivalenceService, $currentDataService, $navigationService) {
        $scope.totalItems = 0
        $scope.keyEquivalence = $keyEquivalenceService.equivalences()
        $scope.allowClick = true
        $scope.clickAction = item => {
          if (instance.path === '/agents' || new RegExp(/^\/agents\/groups\/[a-zA-Z0-9]*$/).test(instance.path)) {
            // Go to and store an agent details
            $currentDataService.setCurrentAgent(item.id)
            $currentDataService.addFilter(`{"agent.id":"${item.id}", "implicit":true}`)
            $navigationService.storeRoute('agents')
            $state.go('agent-overview', { id: item.id })
          } else if (instance.path === '/agents/groups') {
            $scope.$emit('wazuhShowGroup', { group: item })
          } else if (new RegExp(/^\/agents\/groups\/[a-zA-Z0-9]*\/files$/).test(instance.path)) {
            $scope.$emit('wazuhShowGroupFile', { groupName: instance.path.split('groups/')[1].split('/files')[0], fileName: item.filename })
          } else if (instance.path === '/rules') {
            $state.go('mg-rules-id', { id: item.id })
          } else if (instance.path.includes('/decoders')) {
            $state.go('mg-decoders-id', { file: item.file, name: item.name })
          } else if (instance.path === '/cluster/nodes') {
            $scope.$emit('wazuhShowClusterNode', { node: item })
          }
        }

        let realTime = false

        $scope.wazuh_table_loading = true
        //// PAGINATION ////////////////////
        $scope.itemsPerPage = $scope.rowsPerPage || 10
        $scope.pagedItems = []
        $scope.currentPage = 0
        let items = []
        $scope.gap = 0

        // init the filtered items
        $scope.searchTable = function () {
          $scope.filteredItems = items
          $scope.currentPage = 0
          // now group by pages
          $scope.groupToPages()
        }

        // calculate page in place
        $scope.groupToPages = function () {
          $scope.pagedItems = []

          for (let i = 0; i < $scope.filteredItems.length; i++) {
            if (i % $scope.itemsPerPage === 0) {
              $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [$scope.filteredItems[i]]
            } else {
              $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i])
            }
          }
        }

        $scope.range = function (size, start, end) {
          const ret = []

          if (size < end) {
            end = size
            start = size - $scope.gap
          }
          for (let i = start; i < end; i++) {
            ret.push(i)
          }
          return ret
        }

        $scope.prevPage = function () {
          if ($scope.currentPage > 0) {
            $scope.currentPage--
          }

        }

        const fetch = async (options = {}) => {
          try {
            const result = await instance.fetch(options)
            items = options.realTime ? result.items.slice(0, 10) : result.items
            $scope.time = result.time
            $scope.totalItems = items.length
            $scope.items = items
            checkGap()
            $scope.searchTable()
            return
          } catch (error) {
            return Promise.reject(error)
          }
        }

        $scope.nextPage = async currentPage => {
          try {
            if (!currentPage && ($scope.currentPage < $scope.pagedItems.length - 1)) {
              $scope.currentPage++
            }
            if ($scope.pagedItems[currentPage || $scope.currentPage].includes(null)) {
              const copy = $scope.currentPage
              $scope.wazuh_table_loading = true
              const currentNonNull = $scope.items.filter(item => !!item)
              await fetch({ offset: currentNonNull.length })
              $scope.wazuh_table_loading = false
              $scope.currentPage = copy
              if (!$scope.$$phase) $scope.$digest()
            }
          } catch (error) {
            $notificationService.showSimpleToast(`Error paginating table due to ${error.message || error}`)
          }
          return

        }

        $scope.setPage = function () {
          $scope.currentPage = this.n
          $scope.nextPage(this.n)
        }
        ////////////////////////////////////

        const instance = new $dataService($scope.path, $scope.implicitFilter)
        $scope.items = []

        $scope.sort = async field => {
          try {
            $scope.wazuh_table_loading = true
            instance.addSorting(field.value || field)
            $scope.sortValue = instance.sortValue
            $scope.sortDir = instance.sortDir
            await fetch()
            $scope.wazuh_table_loading = false
            if (!$scope.$$phase) $scope.$digest()
          } catch (error) {
            $notificationService.showSimpleToast(`Error sorting table by ${field ? field.value : 'undefined'}. ${error.message || error}`)
          }
          return
        }

        const search = async (term, removeFilters) => {
          try {
            $scope.wazuh_table_loading = true
            if (removeFilters) instance.removeFilters()
            instance.addFilter('search', term)
            $tableFilterService.set(instance.filters)
            await fetch()
            $scope.wazuh_table_loading = false
            if (!$scope.$$phase) $scope.$digest()
          } catch (error) {
            $notificationService.showSimpleToast(`Error searching. ${error.message || error}`)
          }
          return
        }

        const filter = async filter => {
          try {
            $scope.wazuh_table_loading = true
            if (_.isArray(filter)) {
              filter.forEach(item => {
                if (item.name === 'platform' && instance.path === '/agents') {
                  const platform = item.value.split(' - ')[0]
                  const version = item.value.split(' - ')[1]
                  instance.addFilter('os.platform', platform)
                  instance.addFilter('os.version', version)
                } else {
                  instance.addFilter(item.name, item.value)
                }
              })
            } else if (filter.name === 'platform' && instance.path === '/agents') {
              const platform = filter.value.split(' - ')[0]
              const version = filter.value.split(' - ')[1]
              instance.addFilter('os.platform', platform)
              instance.addFilter('os.version', version)
            } else {
              instance.addFilter(filter.name, filter.value)
            }
            $tableFilterService.set(instance.filters)
            await fetch()
            $scope.wazuh_table_loading = false
            if (!$scope.$$phase) $scope.$digest()
          } catch (error) {
            $notificationService.showSimpleToast(`Error filtering by ${filter ? filter.value : 'undefined'}. ${error.message || error}`)
          }
          return
        }

        $scope.$on('wazuhUpdateInstancePath', (event, parameters) => {
          instance.filters = []
          instance.path = parameters.path
          return init()
        })

        $scope.$on('wazuhFilter', (event, parameters) => {
          return filter(parameters.filter)
        })

        $scope.$on('wazuhSearch', (event, parameters) => {
          if (parameters && parameters.specificPath && !instance.path.includes(parameters.specificPath)) {
            return
          }
          return search(parameters.term, parameters.removeFilters)
        })

        $scope.$on('wazuhRemoveFilter', (event, parameters) => {
          instance.filters = instance.filters.filter(item => item.name !== parameters.filterName)
          $tableFilterService.set(instance.filters)
          return init()
        })

        const realTimeFunction = async () => {
          try {

            while (realTime) {
              await fetch({ realTime: true, limit: 10 })
              if (!$scope.$$phase) $scope.$digest()
              await $timeout(1000)
            }
          } catch (error) {
            realTime = false
            $notificationService.showSimpleToast(`Real time feature aborted. ${error.message || error}`)
          }
          return
        }

        $scope.$on('wazuhPlayRealTime', () => {
          realTime = true
          return realTimeFunction()
        })

        $scope.$on('wazuhStopRealTime', () => {
          realTime = false
          return init()
        })

        const checkGap = () => {
          const gap = items.length / $scope.itemsPerPage
          const gapInteger = parseInt(gap)
          $scope.gap = gap - gapInteger > 0 ? gapInteger + 1 : gapInteger
          if ($scope.gap > 5) $scope.gap = 5
        }

        const init = async () => {
          try {
            $scope.wazuh_table_loading = true
            await fetch()
            $tableFilterService.set(instance.filters)
            $scope.wazuh_table_loading = false
            $scope.$emit('loadedTable')
            if (!$scope.$$phase) $scope.$digest()
          } catch (error) {
            console.error('error ',error)
            $notificationService.showSimpleToast(`Error while init table. ${error.message || error}`)
          }
          return
        }

        init()

        const splitArray = array => {
          if (Array.isArray(array)) {
            if (!array.length) return false
            let str = ''
            for (const item of array) str += `${item}, `
            str = str.substring(0, str.length - 2)
            return str
          }
          return array
        }

        const checkIfArray = item => typeof item === 'object' ?
          splitArray(item) :
          item == 0 ?
            '0' :
            item

        $scope.$on('$destroy', () => {
          realTime = null
          $tableFilterService.set([])
        })

        $scope.nonDecoderValue = (key, item) => {
          return key.value === 'local.ip'
            ? (item.local && item.local.ip
              ? `${item.local.ip}:${item.local.port}`
              : false) || '---'
            : key === 'remote.ip'
              ? (item.remote && item.remote.ip
                ? `${item.remote.ip}:${item.remote.port}`
                : false) || '---'
              : key === 'os.name'
                ? (item.os && item.os.name ? item.os.name : false) || '---'
                : key === 'os.version'
                  ? (item.os && item.os.version ? item.os.version : false) ||
                  '---'
                  : checkIfArray(item[key.value || key]) || '---'
        }

        $scope.decoderValue = (key, item) => {
          return key === 'details.program_name' ||
            key.value === 'details.program_name'
            ? (item.details && item.details.program_name
              ? item.details.program_name
              : false) || '---'
            : key === 'details.order' || key.value === 'details.order'
              ? (item.details && item.details.order
                ? item.details.order
                : false) || '---'
              : checkIfArray(item[key.value || key]) || '---'
        }

      },
      templateUrl: BASE_URL + '/static/app/SplunkAppForWazuh/js/directives/wz-table/wz-table.html'
    }
  })
})