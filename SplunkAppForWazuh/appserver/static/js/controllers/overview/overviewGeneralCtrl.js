define([
  '../module',
  "splunkjs/mvc",
  "splunkjs/mvc/utils",
  "splunkjs/mvc/tokenutils",
  "underscore",
  "jquery",
  "splunkjs/mvc/simplexml",
  "splunkjs/mvc/simplexml/dashboardview",
  "splunkjs/mvc/simplexml/element/chart",
  "splunkjs/mvc/simplexml/element/table",
  "splunkjs/mvc/simpleform/formutils",
  "splunkjs/mvc/simplexml/searcheventhandler",
  "splunkjs/mvc/simpleform/input/timerange",
  "splunkjs/mvc/searchmanager",
  "splunkjs/mvc/simplexml/urltokenmodel"
], function (controllers,
  mvc,
  utils,
  TokenUtils,
  _,
  $,
  DashboardController,
  Dashboard,
  ChartElement,
  TableElement,
  FormUtils,
  SearchEventHandler,
  TimeRangeInput,
  SearchManager,
  UrlTokenModel) {
    'use strict'

    controllers.controller('overviewGeneralCtrl', function ($scope, $currentDataService, $state, $notificationService, $requestService, pollingState) {
      const vm = this
      const epoch = (new Date).getTime()
      let pollingEnabled = true
      if (pollingState && pollingState.data && (pollingState.data.error || pollingState.data.disabled === 'true')) {
        pollingEnabled = false
        $notificationService.showSimpleToast(pollingState.data.error)
      }
      // Create token namespaces
      const urlTokenModel = new UrlTokenModel({ id: 'tokenModel' + epoch })
      mvc.Components.registerInstance('url' + epoch, urlTokenModel)
      const defaultTokenModel = mvc.Components.getInstance('default', { create: true })
      const submittedTokenModel = mvc.Components.getInstance('submitted', { create: true })
      let filters = $currentDataService.getSerializedFilters()
      const baseUrl = $currentDataService.getBaseUrl()
      const launchSearches = () => {
        filters = $currentDataService.getSerializedFilters()
        $state.reload();
      }

      $scope.$on('deletedFilter', () => {
        launchSearches()
      })

      $scope.$on('barFilter', () => {
        launchSearches()
      })

      let search9 = ''
      let element9 = ''
      if (!pollingEnabled) {
        vm.wzMonitoringEnabled = false
        $requestService.apiReq(`/agents/summary`).then((data) => {
          vm.agentsCountTotal = data.data.data.Total - 1
          vm.agentsCountActive = data.data.data.Active - 1
          vm.agentsCountDisconnected = data.data.data.Disconnected
          vm.agentsCountNeverConnected = data.data.data['Never connected']
          vm.agentsCoverity = vm.agentsCountTotal ? (vm.agentsCountActive / vm.agentsCountTotal) * 100 : 0;
          if (!$scope.$$phase) $scope.$digest()

        }).catch((error) => {
          $notificationService.showSimpleToast('Cannot fetch agent status data')
        })

      } else {
        vm.wzMonitoringEnabled = true
        search9 = new SearchManager({
          "id": "search9" + epoch,
          "earliest_time": "$when.earliest$",
          "latest_time": "$when.latest$",
          "status_buckets": 0,
          "sample_ratio": null,
          "cancelOnUnload": true,
          "search": `index=wazuh-monitoring-3x status=* | timechart span=1h count by status usenull=f`,
          "app": utils.getCurrentApp(),
          "auto_cancel": 90,
          "preview": true,
          "tokenDependencies": {
          },
          "runWhenTimeIsUndefined": false
        }, { tokens: true, tokenNamespace: "submitted" })

        element9 = new ChartElement({
          "id": "element9" + epoch,
          "charting.legend.placement": "right",
          "charting.drilldown": "none",
          "refresh.display": "progressbar",
          "charting.chart": "area",
          "charting.axisLabelsX.majorLabelStyle.rotation": "-90",
          "trellis.enabled": "0",
          "resizable": true,
          "trellis.scales.shared": "1",
          "charting.axisTitleX.visibility": "visible",
          "charting.axisTitleY.visibility": "visible",
          "charting.axisTitleY2.visibility": "visible",
          "managerid": "search9" + epoch,
          "el": $('#element9')
        }, { tokens: true, tokenNamespace: "submitted" }).render()
      }


      urlTokenModel.on('url:navigate', function () {
        defaultTokenModel.set(urlTokenModel.toJSON())
        if (!_.isEmpty(urlTokenModel.toJSON()) && !_.all(urlTokenModel.toJSON(), _.isUndefined)) {
          submitTokens()
        } else {
          submittedTokenModel.clear()
        }
      })

      // Initialize tokens
      defaultTokenModel.set(urlTokenModel.toJSON())

      function submitTokens() {
        // Copy the contents of the defaultTokenModel to the submittedTokenModel and urlTokenModel
        FormUtils.submitForm({ replaceState: pageLoading })
      }

      function setToken(name, value) {
        defaultTokenModel.set(name, value)
        submittedTokenModel.set(name, value)
      }

      function unsetToken(name) {
        defaultTokenModel.unset(name)
        submittedTokenModel.unset(name)
      }

      submittedTokenModel.on("change:authSuccessToken", (model, authSuccessToken, options) => {
        const tokHTMLJS = submittedTokenModel.get("authSuccessToken")
        if (typeof tokHTMLJS !== 'undefined' && tokHTMLJS !== 'undefined') {
          vm.authSuccess = tokHTMLJS
          if (!$scope.$$phase) $scope.$digest()
        }
      })

      let pageLoading = true
      let input1 = ''
      let overviewSearch5 = ''
      let overviewSearch6 = ''
      let overviewSearch7 = ''
      let overviewSearch8 = ''
      let overviewSearch14 = ''
      let totalAlerts = ''
      let searchLevel12 = ''
      let searchAuthFailure = ''
      let searchAuthSuccess = ''
      let overviewElement5 = ''
      let overviewElement6 = ''
      let overviewElement7 = ''
      let overviewElement8 = ''
      let overviewElement14 = ''

      /**
       * When controller is destroyed
       */
      $scope.$on('$destroy', () => {
        overviewSearch5.cancel()
        overviewSearch6.cancel()
        overviewSearch7.cancel()
        overviewSearch8.cancel()
        overviewSearch14.cancel()
        totalAlerts.cancel()
        searchLevel12.cancel()
        searchAuthFailure.cancel()
        searchAuthSuccess.cancel()
        overviewSearch5 = null
        overviewSearch6 = null
        overviewSearch7 = null
        overviewSearch8 = null
        element9 = null
        overviewSearch14 = null
        search9 = null
        overviewElement5 = null
        overviewElement6 = null
        overviewElement7 = null
        overviewElement8 = null
        overviewElement14 = null
        input1 = null
        totalAlerts = null
        searchLevel12 = null
        searchAuthFailure = null
        searchAuthSuccess = null
      })


      // Listen for a change to the token tokenTotalAlerts value
      totalAlerts = new SearchManager({
        "id": "totalAlerts" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} | stats count`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": true
      }, { tokens: true, tokenNamespace: "submitted" })

      new SearchEventHandler({
        managerid: "totalAlerts" + epoch,
        event: "done",
        conditions: [
          {
            attr: "any",
            value: "*",
            actions: [
              { "type": "set", "token": "totalAlertsToken", "value": "$result.count$" },
            ]
          }
        ]
      })
      totalAlerts.on('search:done', () => {
        const totalAlertsTokenJS = submittedTokenModel.get("totalAlertsToken")
        if (totalAlertsTokenJS && totalAlertsTokenJS !== '$result.count$') {
          vm.totalAlerts = totalAlertsTokenJS
          if (!$scope.$$phase) $scope.$digest()
        }
      })
      submittedTokenModel.on("change:totalAlertsToken", (model, totalAlertsToken, options) => {
        const totalAlertsTokenJS = submittedTokenModel.get("totalAlertsToken")
        if (typeof totalAlertsTokenJS !== 'undefined' && totalAlertsTokenJS !== 'undefined') {
          vm.totalAlerts = totalAlertsTokenJS
          if (!$scope.$$phase) $scope.$digest()
        }
      })

      // ------------ LEVEL 12 ------------ //
      searchLevel12 = new SearchManager({
        "id": "searchLevel12" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh \"rule.level\">=12 | chart count`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": true
      }, { tokens: true, tokenNamespace: "submitted" })

      new SearchEventHandler({
        managerid: "searchLevel12" + epoch,
        event: "done",
        conditions: [
          {
            attr: "any",
            value: "*",
            actions: [
              { "type": "set", "token": "level12token", "value": "$result.count$" },
            ]
          }
        ]
      })

      searchLevel12.on('search:done', () => {
        const level12TokenJS = submittedTokenModel.get("level12token")
        if (level12TokenJS && level12TokenJS !== '$result.count$') {
          vm.levelTwelve = level12TokenJS
          if (!$scope.$$phase) $scope.$digest()
        }
      })
      submittedTokenModel.on("change:level12token", (model, level12token, options) => {
        const level12TokenJS = submittedTokenModel.get("level12token")
        if (typeof level12TokenJS !== 'undefined' && level12TokenJS !== 'undefined') {
          vm.levelTwelve = level12TokenJS
          if (!$scope.$$phase) $scope.$digest()
        }
      })

      searchAuthFailure = new SearchManager({
        "id": "searchAuthFailure" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh  \"rule.groups\"=\"authentication_fail*\" | stats count`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": true
      }, { tokens: true, tokenNamespace: "submitted" })

      new SearchEventHandler({
        managerid: "searchAuthFailure" + epoch,
        event: "done",
        conditions: [
          {
            attr: "any",
            value: "*",
            actions: [
              { "type": "set", "token": "authFailureToken", "value": "$result.count$" },
            ]
          }
        ]
      })
      searchAuthFailure.on('search:done', () => {
        const authFailureTokenJS = submittedTokenModel.get("authFailureToken")
        if (authFailureTokenJS && authFailureTokenJS !== '$result.count$') {
          vm.authFailure = authFailureTokenJS
          if (!$scope.$$phase) $scope.$digest()
        }
      })
      submittedTokenModel.on("change:authFailureToken", (model, authFailureToken, options) => {
        const authFailureTokenJS = submittedTokenModel.get("authFailureToken")
        if (typeof authFailureTokenJS !== 'undefined' && authFailureTokenJS !== 'undefined') {
          vm.authFailure = authFailureTokenJS
          if (!$scope.$$phase) $scope.$digest()
        }
      })

      searchAuthSuccess = new SearchManager({
        "id": "searchAuthSuccess" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh  \"rule.groups\"=\"authentication_success\" | stats count`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": true
      }, { tokens: true, tokenNamespace: "submitted" })

      new SearchEventHandler({
        managerid: "searchAuthSuccess" + epoch,
        event: "done",
        conditions: [
          {
            attr: "any",
            value: "*",
            actions: [
              { "type": "set", "token": "authSuccessToken", "value": "$result.count$" },
            ]
          }
        ]
      })
      searchAuthSuccess.on('search:done', () => {
        const authSuccessTokenJS = submittedTokenModel.get("authSuccessToken")
        if (authSuccessTokenJS && authSuccessTokenJS !== '$result.count$') {
          vm.authSuccess = authSuccessTokenJS
          if (!$scope.$$phase) $scope.$digest()
        } else {
          vm.authSuccess = '-'
          if (!$scope.$$phase) $scope.$digest()
        }
      })
      submittedTokenModel.on("change:authSuccessToken", (model, authSuccessToken, options) => {
        const authSuccessTokenJS = submittedTokenModel.get("authSuccessToken")
        if (typeof authSuccessTokenJS !== 'undefined' && authSuccessTokenJS !== 'undefined') {
          vm.authSuccess = authSuccessTokenJS
          if (!$scope.$$phase) $scope.$digest()
        }
      })
      overviewSearch5 = new SearchManager({
        "id": "search5" + epoch,
        "cancelOnUnload": true,
        "earliest_time": "$when.earliest$",
        "sample_ratio": 1,
        "status_buckets": 0,
        "latest_time": "$when.latest$",
        "search": `${filters} sourcetype=wazuh rule.level=*| timechart count by rule.level`,
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": false
      }, { tokens: true, tokenNamespace: "submitted" })

      overviewSearch6 = new SearchManager({
        "id": "search6" + epoch,
        "cancelOnUnload": true,
        "earliest_time": "$when.earliest$",
        "sample_ratio": 1,
        "status_buckets": 0,
        "latest_time": "$when.latest$",
        "search": `${filters} sourcetype=wazuh | timechart span=2h count`,
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": false
      }, { tokens: true, tokenNamespace: "submitted" })

      overviewSearch7 = new SearchManager({
        "id": "search7" + epoch,
        "cancelOnUnload": true,
        "earliest_time": "$when.earliest$",
        "sample_ratio": 1,
        "status_buckets": 0,
        "latest_time": "$when.latest$",
        "search": `${filters} sourcetype=wazuh | top \"agent.name\"`,
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": false
      }, { tokens: true, tokenNamespace: "submitted" })

      overviewSearch8 = new SearchManager({
        "id": "search8" + epoch,
        "cancelOnUnload": true,
        "earliest_time": "$when.earliest$",
        "sample_ratio": 1,
        "status_buckets": 0,
        "latest_time": "$when.latest$",
        "search": `${filters} sourcetype=wazuh | timechart span=1h limit=5 useother=f count by agent.name`,
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": false
      }, { tokens: true, tokenNamespace: "submitted" })

      overviewSearch14 = new SearchManager({
        "id": "search14" + epoch,
        "cancelOnUnload": true,
        "earliest_time": "$when.earliest$",
        "sample_ratio": 1,
        "status_buckets": 0,
        "latest_time": "$when.latest$",
        "search": `${filters} sourcetype=wazuh |stats count sparkline by rule.id, rule.description, rule.groups, rule.level | sort count DESC | head 10 | rename rule.id as \"Rule ID\", rule.description as \"Description\", rule.level as Level, count as Count, rule.groups as \"Rule group\"`,
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": false
      }, { tokens: true, tokenNamespace: "submitted" })


      //
      // SPLUNK LAYOUT
      //


      //
      // DASHBOARD EDITOR
      //

      new Dashboard({
        id: 'dashboard' + epoch,
        el: $('.dashboard-body'),
        showTitle: true,
        editable: false
      }, { tokens: true }).render()

      overviewElement5 = new ChartElement({
        "id": "overviewElement5" + epoch,
        "trellis.size": "medium",
        "charting.axisY2.scale": "inherit",
        "charting.chart.showDataLabels": "none",
        "charting.chart.stackMode": "stacked100",
        "resizable": true,
        "charting.axisTitleY2.visibility": "visible",
        "charting.drilldown": "none",
        "charting.chart": "line",
        "charting.layout.splitSeries.allowIndependentYRanges": "0",
        "charting.chart.nullValueMode": "gaps",
        "trellis.scales.shared": "1",
        "charting.layout.splitSeries": "0",
        "charting.axisTitleX.visibility": "collapsed",
        "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
        "charting.chart.style": "minimal",
        "charting.axisTitleY.visibility": "visible",
        "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
        "charting.chart.bubbleMinimumSize": "10",
        "charting.axisX.scale": "linear",
        "trellis.enabled": "0",
        "charting.axisY2.enabled": "0",
        "charting.legend.placement": "right",
        "charting.chart.bubbleSizeBy": "area",
        "charting.axisLabelsX.majorLabelStyle.rotation": "0",
        "charting.chart.bubbleMaximumSize": "50",
        "charting.chart.sliceCollapsingThreshold": "0.01",
        "charting.axisY.scale": "linear",
        "managerid": "search5" + epoch,
        "el": $('#overviewElement5')
      }, { tokens: true, tokenNamespace: "submitted" }).render()


      overviewElement6 = new ChartElement({
        "id": "overviewElement6" + epoch,
        "trellis.size": "medium",
        "charting.axisY2.scale": "inherit",
        "charting.chart.showDataLabels": "all",
        "charting.chart.stackMode": "default",
        "resizable": true,
        "charting.axisTitleY2.visibility": "visible",
        "charting.drilldown": "none",
        "charting.chart": "column",
        "charting.layout.splitSeries.allowIndependentYRanges": "0",
        "charting.chart.nullValueMode": "gaps",
        "trellis.scales.shared": "1",
        "charting.layout.splitSeries": "0",
        "charting.axisTitleX.visibility": "collapsed",
        "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
        "charting.chart.style": "shiny",
        "charting.axisTitleY.visibility": "visible",
        "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
        "charting.chart.bubbleMinimumSize": "10",
        "charting.axisX.scale": "linear",
        "trellis.enabled": "0",
        "charting.axisY2.enabled": "0",
        "charting.legend.placement": "none",
        "charting.chart.bubbleSizeBy": "area",
        "charting.axisLabelsX.majorLabelStyle.rotation": "0",
        "charting.chart.bubbleMaximumSize": "50",
        "charting.chart.sliceCollapsingThreshold": "0.01",
        "charting.axisY.scale": "linear",
        "managerid": "search6" + epoch,
        "el": $('#overviewElement6')
      }, { tokens: true, tokenNamespace: "submitted" }).render()


      overviewElement7 = new ChartElement({
        "id": "overviewElement7" + epoch,
        "trellis.size": "large",
        "charting.axisY2.scale": "inherit",
        "charting.chart.showDataLabels": "none",
        "charting.chart.stackMode": "default",
        "resizable": true,
        "charting.axisTitleY2.visibility": "visible",
        "charting.drilldown": "none",
        "charting.chart": "pie",
        "charting.layout.splitSeries.allowIndependentYRanges": "0",
        "charting.chart.nullValueMode": "gaps",
        "trellis.scales.shared": "1",
        "charting.layout.splitSeries": "0",
        "charting.axisTitleX.visibility": "visible",
        "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
        "charting.chart.style": "shiny",
        "charting.axisTitleY.visibility": "visible",
        "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
        "charting.chart.bubbleMinimumSize": "10",
        "charting.axisX.scale": "linear",
        "trellis.enabled": "0",
        "charting.axisY2.enabled": "0",
        "charting.legend.placement": "right",
        "charting.chart.bubbleSizeBy": "area",
        "charting.axisLabelsX.majorLabelStyle.rotation": "0",
        "charting.chart.bubbleMaximumSize": "50",
        "charting.chart.sliceCollapsingThreshold": "0.01",
        "charting.axisY.scale": "linear",
        "managerid": "search7" + epoch,
        "el": $('#overviewElement7')
      }, { tokens: true, tokenNamespace: "submitted" }).render()


      overviewElement8 = new ChartElement({
        "id": "overviewElement8" + epoch,
        "trellis.size": "medium",
        "charting.axisY2.scale": "inherit",
        "charting.chart.showDataLabels": "minmax",
        "charting.chart.stackMode": "default",
        "resizable": true,
        "charting.axisTitleY2.visibility": "visible",
        "charting.drilldown": "none",
        "charting.chart": "area",
        "charting.layout.splitSeries.allowIndependentYRanges": "0",
        "charting.chart.nullValueMode": "gaps",
        "trellis.scales.shared": "1",
        "charting.layout.splitSeries": "0",
        "charting.axisTitleX.visibility": "collapsed",
        "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
        "charting.chart.style": "shiny",
        "charting.axisTitleY.visibility": "visible",
        "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
        "charting.chart.bubbleMinimumSize": "10",
        "charting.axisX.scale": "linear",
        "trellis.enabled": "0",
        "charting.axisY2.enabled": "0",
        "charting.legend.placement": "bottom",
        "charting.chart.bubbleSizeBy": "area",
        "charting.axisLabelsX.majorLabelStyle.rotation": "0",
        "charting.chart.bubbleMaximumSize": "50",
        "charting.chart.sliceCollapsingThreshold": "0.01",
        "charting.axisY.scale": "linear",
        "managerid": "search8" + epoch,
        "el": $('#overviewElement8')
      }, { tokens: true, tokenNamespace: "submitted" }).render()

      overviewElement14 = new TableElement({
        "id": "overviewElement14" + epoch,
        "dataOverlayMode": "none",
        "drilldown": "cell",
        "percentagesRow": "false",
        "rowNumbers": "false",
        "totalsRow": "false",
        "wrap": "true",
        "managerid": "search14" + epoch,
        "el": $('#overviewElement14')
      }, { tokens: true, tokenNamespace: "submitted" }).render()

      overviewElement14.on("click", function (e) {
        if (e.field !== undefined) {
          e.preventDefault()
          const url = TokenUtils.replaceTokenNames(`${baseUrl}/app/SplunkAppForWazuh/search?q=${filters} sourcetype=wazuh |stats count sparkline by rule.id, rule.description, rule.groups, rule.level | sort count DESC | head 10 | rename rule.id as \"Rule ID\", rule.description as \"Description\", rule.level as Level, count as Count, rule.groups as \"Rule group\"&earliest=$when.earliest$&latest=$when.latest$`, _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'), TokenUtils.getFilters(mvc.Components))
          utils.redirect(url, false, "_blank")
        }
      })

      //
      // VIEWS: FORM INPUTS
      //

      input1 = new TimeRangeInput({
        "id": "input1" + epoch,
        "default": { "latest_time": "now", "earliest_time": "-24h@h" },
        "searchWhenChanged": true,
        "earliest_time": "$form.when.earliest$",
        "latest_time": "$form.when.latest$",
        "el": $('#input1')
      }, { tokens: true }).render()

      input1.on("change", function (newValue) {
        if (newValue && input1)
          FormUtils.handleValueChange(input1)
      })

      DashboardController.onReady(function () {
        if (!submittedTokenModel.has('earliest') && !submittedTokenModel.has('latest')) {
          submittedTokenModel.set({ earliest: '0', latest: '' })
        }
      })

      // Initialize time tokens to default
      if (!defaultTokenModel.has('earliest') && !defaultTokenModel.has('latest')) {
        defaultTokenModel.set({ earliest: '0', latest: '' })
      }

      submitTokens()
      //
      // DASHBOARD READY
      //

      DashboardController.ready()
      pageLoading = false
    })
  })

