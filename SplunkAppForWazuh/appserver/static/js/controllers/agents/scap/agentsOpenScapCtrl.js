define([
  '../../module',
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
  "splunkjs/mvc/simplexml/urltokenmodel",
  "splunkjs/mvc/simpleform/input/dropdown"

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
  UrlTokenModel,
  DropdownInput) {

    'use strict'

    controllers.controller('agentsOpenScapCtrl', function ($scope, $currentDataService, agent) {
      const vm = this
      vm.agent = agent.data.data
      const epoch = (new Date).getTime()
      // Create token namespaces
      const urlTokenModel = new UrlTokenModel({ id: 'tokenModel' + epoch })
      mvc.Components.registerInstance('url' + epoch, urlTokenModel)
      const defaultTokenModel = mvc.Components.getInstance('default', { create: true })
      const submittedTokenModel = mvc.Components.getInstance('submitted', { create: true })
      const filters = $currentDataService.getSerializedFilters()
      urlTokenModel.on('url:navigate', function () {
        defaultTokenModel.set(urlTokenModel.toJSON())
        if (!_.isEmpty(urlTokenModel.toJSON()) && !_.all(urlTokenModel.toJSON(), _.isUndefined)) {
          submitTokens()
        } else {
          submittedTokenModel.clear()
        }
      })

      let pageLoading = true

      // Initialize tokens
      defaultTokenModel.set(urlTokenModel.toJSON())

      const submitTokens = () => {
        FormUtils.submitForm({ replaceState: pageLoading })
      }
      const setToken = (name, value) => {
        defaultTokenModel.set(name, value)
        submittedTokenModel.set(name, value)
      }

      const unsetToken = (name) => {
        defaultTokenModel.unset(name)
        submittedTokenModel.unset(name)
      }

      let lastScapScore = ''
      let maxScapScore = ''
      let scapLowest = ''
      let input1 = ''
      let input2 = ''
      let search4 = ''
      let search5 = ''
      let search15 = ''
      let search6 = ''
      let search7 = ''
      let search8 = ''
      let search9 = ''
      let search10 = ''
      let search14 = ''
      let element4 = ''
      let element5 = ''
      let element6 = ''
      let element7 = ''
      let element8 = ''
      let element9 = ''
      let element10 = ''
      let element14 = ''
      /**
       * When controller is destroyed
       */
      $scope.$on('$destroy', () => {
        lastScapScore.cancel()
        maxScapScore.cancel()
        scapLowest.cancel()
        lastScapScore = null
        maxScapScore = null
        scapLowest = null
        input1.off()
        input2.off()
        input1 = null
        input2 = null
        search4
        search5.cancel()
        search15.cancel()
        search6.cancel()
        search7.cancel()
        search8.cancel()
        search9.cancel()
        search10.cancel()
        search14.cancel()
        search4 = null
        search5 = null
        search15 = null
        search6 = null
        search7 = null
        search8 = null
        search9 = null
        search10 = null
        search14 = null
        element4 = null
        element5 = null
        element6 = null
        element7 = null
        element8 = null
        element9 = null
        element10 = null
        element14 = null
      })

      // Listen for a change to the token tokenTotalAlerts value
      lastScapScore = new SearchManager({
        "id": "lastScapScore" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh oscap.scan.score=* | stats latest(oscap.scan.score)`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": true
      }, { tokens: true, tokenNamespace: "submitted" })

      new SearchEventHandler({
        managerid: "lastScapScore" + epoch,
        event: "done",
        conditions: [
          {
            attr: "any",
            value: "*",
            actions: [
              { "type": "set", "token": "latestScapScore", "value": "$result.latest(oscap.scan.score)$" },
            ]
          }
        ]
      })
      lastScapScore.on('search:progress', () => {
        vm.loadingSearch = true
        if (!$scope.$$phase) $scope.$digest()

      })
      lastScapScore.on('search:done', (data, job) => {
        const latestScapScoreJS = submittedTokenModel.get("latestScapScore")
        if (latestScapScoreJS && latestScapScoreJS !== '$result.latest(oscap.scan.score)$') {
          vm.scapLastScore = latestScapScoreJS
          if (!$scope.$$phase) $scope.$digest()
        } else {
          vm.scapLastScore = '0'
          if (!$scope.$$phase) $scope.$digest()
        }
      })
      submittedTokenModel.on("change:latestScapScore", (model, latestScapScore, options) => {
        const latestScapScoreJS = submittedTokenModel.get("latestScapScore")
        if (latestScapScoreJS && latestScapScoreJS !== '$result.latest(oscap.scan.score)$') {
          vm.scapLastScore = latestScapScoreJS
          if (!$scope.$$phase) $scope.$digest()
        } else {
          vm.scapLastScore = 0
          if (!$scope.$$phase) $scope.$digest()
        }
      })

      // Listen for a change to the token tokenTotalAlerts value
      maxScapScore = new SearchManager({
        "id": "maxScapScore" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh oscap.scan.score=* | stats max(oscap.scan.score)`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": true
      }, { tokens: true, tokenNamespace: "submitted" })

      new SearchEventHandler({
        managerid: "maxScapScore" + epoch,
        event: "done",
        conditions: [
          {
            attr: "any",
            value: "*",
            actions: [
              { "type": "set", "token": "maxScapScore", "value": "$result.max(oscap.scan.score)$" },
            ]
          }
        ]
      })
      maxScapScore.on('search:progress', () => {
        vm.loadingSearch = true
        if (!$scope.$$phase) $scope.$digest()
      })
      maxScapScore.on('search:done', () => {
        const maxScapScoreJS = submittedTokenModel.get("maxScapScore")
        if (maxScapScoreJS && maxScapScoreJS !== '$result.max(oscap.scan.score)$') {
          vm.scapHighestScore = maxScapScoreJS
          if (!$scope.$$phase) $scope.$digest()
        } else {
          vm.scapHighestScore = '0'
          if (!$scope.$$phase) $scope.$digest()
        }
      })
      submittedTokenModel.on("change:maxScapScore", (model, maxScapScore, options) => {
        const maxScapScoreJS = submittedTokenModel.get("maxScapScore")
        if (maxScapScoreJS && maxScapScoreJS !== '$result.max(oscap.scan.score)$') {
          vm.scapHighestScore = maxScapScoreJS
          if (!$scope.$$phase) $scope.$digest()
        } else {
          vm.scapHighestScore = 0
          if (!$scope.$$phase) $scope.$digest()
        }
      })

      // Listen for a change to the token tokenTotalAlerts value
      scapLowest = new SearchManager({
        "id": "scapLowest" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh oscap.scan.score=* | stats min(oscap.scan.score)`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": true
      }, { tokens: true, tokenNamespace: "submitted" })

      new SearchEventHandler({
        managerid: "scapLowest" + epoch,
        event: "done",
        conditions: [
          {
            attr: "any",
            value: "*",
            actions: [
              { "type": "set", "token": "minScapScore", "value": "$result.min(oscap.scan.score)$" },
            ]
          }
        ]
      })
      scapLowest.on('search:progress', () => {
        vm.loadingSearch = true
        if (!$scope.$$phase) $scope.$digest()

      })
      scapLowest.on('search:done', () => {
        const minScapScoreJS = submittedTokenModel.get("minScapScore")
        if (minScapScoreJS && minScapScoreJS !== "$result.min(oscap.scan.score)$") {
          vm.scapLowestScore = minScapScoreJS
          if (!$scope.$$phase) $scope.$digest()
        } else {
          vm.scapLowestScore = '0'
          if (!$scope.$$phase) $scope.$digest()
        }
      })
      submittedTokenModel.on("change:minScapScore", (model, minScapScore, options) => {
        const minScapScoreJS = submittedTokenModel.get("minScapScore")
        if (minScapScoreJS && minScapScoreJS !== "$result.min(oscap.scan.score)$") {
          vm.scapLowestScore = minScapScoreJS
          if (!$scope.$$phase) $scope.$digest()
        } else {
          vm.scapLowestScore = '0'
          if (!$scope.$$phase) $scope.$digest()
        }
      })

      // Searches
      search4 = new SearchManager({
        "id": "search4" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=\"$profile$\" | top agent.name`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": false
      }, { tokens: true, tokenNamespace: "submitted" })

      search5 = new SearchManager({
        "id": "search5" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=\"$profile$\" | top oscap.scan.profile.title`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": false
      }, { tokens: true, tokenNamespace: "submitted" })

      search6 = new SearchManager({
        "id": "search6" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=\"$profile$\" | top oscap.scan.content`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": false
      }, { tokens: true, tokenNamespace: "submitted" })

      search15 = new SearchManager({
        "id": "search15" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": null,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh  rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=* | stats count by oscap.scan.profile.title | sort oscap.scan.profile.title ASC|fields - count`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": false
      }, { tokens: true })

      search7 = new SearchManager({
        "id": "search7" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups!=\"syslog\" oscap.scan.profile.title=\"$profile$\" | top oscap.check.severity`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": false
      }, { tokens: true, tokenNamespace: "submitted" })

      search8 = new SearchManager({
        "id": "search8" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh rule.groups=\"oscap\" oscap.scan.profile.title=\"$profile$\" oscap.check.severity=\"high\" | chart count by agent.name`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": false
      }, { tokens: true, tokenNamespace: "submitted" })

      search9 = new SearchManager({
        "id": "search9" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups=\"oscap-result\" oscap.scan.profile.title=\"$profile$\" | top oscap.check.title`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": false
      }, { tokens: true, tokenNamespace: "submitted" })

      search10 = new SearchManager({
        "id": "search10" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" rule.groups=\"oscap-result\"  oscap.check.severity=\"high\" oscap.scan.profile.title=\"$profile$\" | top oscap.check.title`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": false
      }, { tokens: true, tokenNamespace: "submitted" })

      search14 = new SearchManager({
        "id": "search14" + epoch,
        "cancelOnUnload": true,
        "sample_ratio": 1,
        "earliest_time": "$when.earliest$",
        "status_buckets": 0,
        "search": `${filters} sourcetype=wazuh oscap.check.result=\"fail\" rule.groups=\"oscap\" oscap.scan.profile.title=\"$profile$\" | stats count by agent.name, oscap.check.title, oscap.scan.profile.title, oscap.scan.id, oscap.scan.content | sort count DESC | rename agent.name as \"Agent name\", oscap.check.title as Title, oscap.scan.profile.title as Profile, oscap.scan.id as \"Scan ID\", oscap.scan.content as Content`,
        "latest_time": "$when.latest$",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "preview": true,
        "tokenDependencies": {
        },
        "runWhenTimeIsUndefined": false
      }, { tokens: true, tokenNamespace: "submitted" })

      element4 = new ChartElement({
        "id": "element4" + epoch,
        "charting.axisY2.scale": "inherit",
        "trellis.size": "medium",
        "charting.chart.stackMode": "default",
        "resizable": true,
        "charting.layout.splitSeries.allowIndependentYRanges": "0",
        "charting.drilldown": "none",
        "charting.chart.nullValueMode": "gaps",
        "charting.axisTitleY2.visibility": "visible",
        "charting.chart": "pie",
        "trellis.scales.shared": "1",
        "charting.layout.splitSeries": "0",
        "charting.chart.style": "shiny",
        "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
        "charting.axisTitleX.visibility": "visible",
        "charting.axisTitleY.visibility": "visible",
        "charting.axisX.scale": "linear",
        "charting.chart.bubbleMinimumSize": "10",
        "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
        "charting.axisY2.enabled": "0",
        "trellis.enabled": "0",
        "charting.legend.placement": "right",
        "charting.chart.bubbleSizeBy": "area",
        "charting.chart.bubbleMaximumSize": "50",
        "charting.axisLabelsX.majorLabelStyle.rotation": "0",
        "charting.axisY.scale": "linear",
        "charting.chart.showDataLabels": "none",
        "charting.chart.sliceCollapsingThreshold": "0.01",
        "managerid": "search4" + epoch,
        "el": $('#element4')
      }, { tokens: true, tokenNamespace: "submitted" }).render()


      element5 = new ChartElement({
        "id": "element5" + epoch,
        "charting.drilldown": "none",
        "resizable": true,
        "charting.chart": "pie",
        "managerid": "search5" + epoch,
        "el": $('#element5')
      }, { tokens: true, tokenNamespace: "submitted" }).render()


      element6 = new ChartElement({
        "id": "element6" + epoch,
        "charting.axisY2.scale": "inherit",
        "trellis.size": "medium",
        "charting.chart.stackMode": "default",
        "resizable": true,
        "charting.layout.splitSeries.allowIndependentYRanges": "0",
        "charting.drilldown": "none",
        "charting.chart.nullValueMode": "gaps",
        "charting.axisTitleY2.visibility": "visible",
        "charting.chart": "bar",
        "trellis.scales.shared": "1",
        "charting.layout.splitSeries": "0",
        "charting.chart.style": "shiny",
        "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
        "charting.axisTitleX.visibility": "collapsed",
        "charting.axisTitleY.visibility": "collapsed",
        "charting.axisX.scale": "linear",
        "charting.chart.bubbleMinimumSize": "10",
        "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
        "charting.axisY2.enabled": "0",
        "trellis.enabled": "0",
        "charting.legend.placement": "none",
        "charting.chart.bubbleSizeBy": "area",
        "charting.chart.bubbleMaximumSize": "50",
        "charting.axisLabelsX.majorLabelStyle.rotation": "-45",
        "charting.axisY.scale": "linear",
        "charting.chart.showDataLabels": "all",
        "charting.chart.sliceCollapsingThreshold": "0.01",
        "managerid": "search6" + epoch,
        "el": $('#element6')
      }, { tokens: true, tokenNamespace: "submitted" }).render()


      element7 = new ChartElement({
        "id": "element7" + epoch,
        "charting.axisY2.scale": "inherit",
        "trellis.size": "medium",
        "charting.chart.stackMode": "default",
        "resizable": true,
        "charting.layout.splitSeries.allowIndependentYRanges": "0",
        "charting.drilldown": "none",
        "charting.chart.nullValueMode": "gaps",
        "charting.axisTitleY2.visibility": "visible",
        "charting.chart": "pie",
        "trellis.scales.shared": "1",
        "charting.layout.splitSeries": "0",
        "charting.chart.style": "shiny",
        "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
        "charting.axisTitleX.visibility": "visible",
        "charting.axisTitleY.visibility": "visible",
        "charting.axisX.scale": "linear",
        "charting.chart.bubbleMinimumSize": "10",
        "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
        "charting.axisY2.enabled": "0",
        "trellis.enabled": "0",
        "charting.legend.placement": "right",
        "charting.chart.bubbleSizeBy": "area",
        "charting.chart.bubbleMaximumSize": "50",
        "charting.axisLabelsX.majorLabelStyle.rotation": "0",
        "charting.axisY.scale": "linear",
        "charting.chart.showDataLabels": "none",
        "charting.chart.sliceCollapsingThreshold": "0.01",
        "managerid": "search7" + epoch,
        "el": $('#element7')
      }, { tokens: true, tokenNamespace: "submitted" }).render()


      element8 = new ChartElement({
        "id": "element8" + epoch,
        "charting.axisY2.scale": "inherit",
        "trellis.size": "medium",
        "charting.chart.stackMode": "default",
        "resizable": true,
        "charting.layout.splitSeries.allowIndependentYRanges": "0",
        "charting.drilldown": "none",
        "charting.chart.nullValueMode": "gaps",
        "charting.axisTitleY2.visibility": "visible",
        "charting.chart": "area",
        "trellis.scales.shared": "1",
        "charting.layout.splitSeries": "0",
        "charting.chart.style": "shiny",
        "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
        "charting.axisTitleX.visibility": "collapsed",
        "charting.axisTitleY.visibility": "visible",
        "charting.axisX.scale": "linear",
        "charting.chart.bubbleMinimumSize": "10",
        "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
        "charting.axisY2.enabled": "0",
        "trellis.enabled": "0",
        "charting.legend.placement": "none",
        "charting.chart.bubbleSizeBy": "area",
        "charting.chart.bubbleMaximumSize": "50",
        "charting.axisLabelsX.majorLabelStyle.rotation": "0",
        "charting.axisY.scale": "linear",
        "charting.chart.showDataLabels": "all",
        "charting.chart.sliceCollapsingThreshold": "0.01",
        "managerid": "search8" + epoch,
        "el": $('#element8')
      }, { tokens: true, tokenNamespace: "submitted" }).render()


      element9 = new ChartElement({
        "id": "element9" + epoch,
        "charting.axisY2.scale": "inherit",
        "trellis.size": "medium",
        "charting.chart.stackMode": "default",
        "resizable": true,
        "charting.layout.splitSeries.allowIndependentYRanges": "0",
        "charting.drilldown": "none",
        "charting.chart.nullValueMode": "gaps",
        "charting.axisTitleY2.visibility": "visible",
        "charting.chart": "pie",
        "trellis.scales.shared": "1",
        "charting.layout.splitSeries": "0",
        "charting.chart.style": "shiny",
        "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
        "charting.axisTitleX.visibility": "collapsed",
        "charting.axisTitleY.visibility": "visible",
        "charting.axisX.scale": "linear",
        "charting.chart.bubbleMinimumSize": "10",
        "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
        "charting.axisY2.enabled": "0",
        "trellis.enabled": "0",
        "charting.legend.placement": "right",
        "charting.chart.bubbleSizeBy": "area",
        "charting.chart.bubbleMaximumSize": "50",
        "charting.axisLabelsX.majorLabelStyle.rotation": "0",
        "charting.axisY.scale": "linear",
        "charting.chart.showDataLabels": "all",
        "charting.chart.sliceCollapsingThreshold": "0.01",
        "managerid": "search9" + epoch,
        "el": $('#element9')
      }, { tokens: true, tokenNamespace: "submitted" }).render()


      element10 = new ChartElement({
        "id": "element10" + epoch,
        "charting.axisY2.scale": "inherit",
        "trellis.size": "medium",
        "charting.chart.stackMode": "default",
        "resizable": true,
        "charting.layout.splitSeries.allowIndependentYRanges": "0",
        "charting.drilldown": "none",
        "charting.chart.nullValueMode": "gaps",
        "charting.axisTitleY2.visibility": "visible",
        "charting.chart": "pie",
        "trellis.scales.shared": "1",
        "charting.layout.splitSeries": "0",
        "charting.chart.style": "shiny",
        "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
        "charting.axisTitleX.visibility": "collapsed",
        "charting.axisTitleY.visibility": "visible",
        "charting.axisX.scale": "linear",
        "charting.chart.bubbleMinimumSize": "10",
        "charting.axisLabelsX.majorLabelStyle.overflowMode": "ellipsisNone",
        "charting.axisY2.enabled": "0",
        "trellis.enabled": "0",
        "charting.legend.placement": "right",
        "charting.chart.bubbleSizeBy": "area",
        "charting.chart.bubbleMaximumSize": "50",
        "charting.axisLabelsX.majorLabelStyle.rotation": "0",
        "charting.axisY.scale": "linear",
        "charting.chart.showDataLabels": "all",
        "charting.chart.sliceCollapsingThreshold": "0.01",
        "managerid": "search10" + epoch,
        "el": $('#element10')
      }, { tokens: true, tokenNamespace: "submitted" }).render()

      element14 = new TableElement({
        "id": "element14" + epoch,
        "dataOverlayMode": "none",
        "drilldown": "cell",
        "percentagesRow": "false",
        "rowNumbers": "true",
        "totalsRow": "false",
        "wrap": "false",
        "managerid": "search14" + epoch,
        "el": $('#element14')
      }, { tokens: true, tokenNamespace: "submitted" }).render()

      input1 = new TimeRangeInput({
        "id": "input1" + epoch,
        "searchWhenChanged": true,
        "default": { "latest_time": "now", "earliest_time": "-24h@h" },
        "earliest_time": "$form.when.earliest$",
        "latest_time": "$form.when.latest$",
        "el": $('#input1')
      }, { tokens: true }).render()

      input2 = new DropdownInput({
        "id": "input2" + epoch,
        "choices": [
          { "label": "ALL", "value": "*" }
        ],
        "labelField": "oscap.scan.profile.title",
        "searchWhenChanged": true,
        "default": "*",
        "valueField": "oscap.scan.profile.title",
        "initialValue": "*",
        "selectFirstChoice": false,
        "showClearButton": true,
        "value": "$form.profile$",
        "managerid": "search15" + epoch,
        "el": $('#input2')
      }, { tokens: true }).render()

      input2.on("change", function (newValue) {
        FormUtils.handleValueChange(input2)
      })

      input1.on("change", (newValue) => {
        if (newValue && input1)
          FormUtils.handleValueChange(input1)
      })

      DashboardController.onReady(() => {
        if (!submittedTokenModel.has('earliest') && !submittedTokenModel.has('latest')) {
          submittedTokenModel.set({ earliest: '0', latest: '' })
        }
      })

      // Initialize time tokens to default
      if (!defaultTokenModel.has('earliest') && !defaultTokenModel.has('latest')) {
        defaultTokenModel.set({ earliest: '0', latest: '' })
      }

      submitTokens()

      DashboardController.ready()

    })
  })
