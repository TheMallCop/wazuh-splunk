// <![CDATA[
// <![CDATA[
//
// LIBRARY REQUIREMENTS
//
// In the require function, we include the necessary libraries and modules for
// the HTML dashboard. Then, we pass variable names for these libraries and
// modules as function parameters, in order.
// 
// When you add libraries or modules, remember to retain this mapping order
// between the library or module and its function parameter. You can do this by
// adding to the end of these lists, as shown in the commented examples below.

require([
  "splunkjs/mvc",
  "splunkjs/mvc/utils",
  "splunkjs/mvc/tokenutils",
  "underscore",
  "jquery",
  "splunkjs/mvc/simplexml",
  "splunkjs/mvc/layoutview",
  "splunkjs/mvc/simplexml/dashboardview",
  "splunkjs/mvc/simplexml/dashboard/panelref",
  "splunkjs/mvc/simplexml/element/chart",
  "splunkjs/mvc/simplexml/element/event",
  "splunkjs/mvc/simplexml/element/html",
  "splunkjs/mvc/simplexml/element/list",
  "splunkjs/mvc/simplexml/element/map",
  "splunkjs/mvc/simplexml/element/single",
  "splunkjs/mvc/simplexml/element/table",
  "splunkjs/mvc/simplexml/element/visualization",
  "splunkjs/mvc/simpleform/formutils",
  "splunkjs/mvc/simplexml/eventhandler",
  "splunkjs/mvc/simplexml/searcheventhandler",
  "splunkjs/mvc/simpleform/input/dropdown",
  "splunkjs/mvc/simpleform/input/radiogroup",
  "splunkjs/mvc/simpleform/input/linklist",
  "splunkjs/mvc/simpleform/input/multiselect",
  "splunkjs/mvc/simpleform/input/checkboxgroup",
  "splunkjs/mvc/simpleform/input/text",
  "splunkjs/mvc/simpleform/input/timerange",
  "splunkjs/mvc/simpleform/input/submit",
  "splunkjs/mvc/searchmanager",
  "splunkjs/mvc/savedsearchmanager",
  "splunkjs/mvc/postprocessmanager",
  "splunkjs/mvc/simplexml/urltokenmodel"
  // Add comma-separated libraries and modules manually here, for example:
  // ..."splunkjs/mvc/simplexml/urltokenmodel",
  // "splunkjs/mvc/tokenforwarder"
],
  function (
    mvc,
    utils,
    TokenUtils,
    _,
    $,
    DashboardController,
    LayoutView,
    Dashboard,
    PanelRef,
    ChartElement,
    EventElement,
    HtmlElement,
    ListElement,
    MapElement,
    SingleElement,
    TableElement,
    VisualizationElement,
    FormUtils,
    EventHandler,
    SearchEventHandler,
    DropdownInput,
    RadioGroupInput,
    LinkListInput,
    MultiSelectInput,
    CheckboxGroupInput,
    TextInput,
    TimeRangeInput,
    SubmitButton,
    SearchManager,
    SavedSearchManager,
    PostProcessManager,
    UrlTokenModel

    // Add comma-separated parameter names here, for example: 
    // ...UrlTokenModel, 
    // TokenForwarder
  ) {

    var pageLoading = true;


    // 
    // TOKENS
    //

    // Create token namespaces
    var urlTokenModel = new UrlTokenModel();
    mvc.Components.registerInstance('url', urlTokenModel);
    var defaultTokenModel = mvc.Components.getInstance('default', { create: true });
    var submittedTokenModel = mvc.Components.getInstance('submitted', { create: true });

    urlTokenModel.on('url:navigate', function () {
      defaultTokenModel.set(urlTokenModel.toJSON());
      if (!_.isEmpty(urlTokenModel.toJSON()) && !_.all(urlTokenModel.toJSON(), _.isUndefined)) {
        submitTokens();
      } else {
        submittedTokenModel.clear();
      }
    });

    // Initialize tokens
    defaultTokenModel.set(urlTokenModel.toJSON());

    function submitTokens() {
      // Copy the contents of the defaultTokenModel to the submittedTokenModel and urlTokenModel
      FormUtils.submitForm({ replaceState: pageLoading });
    }

    function setToken(name, value) {
      defaultTokenModel.set(name, value);
      submittedTokenModel.set(name, value);
    }

    function unsetToken(name) {
      defaultTokenModel.unset(name);
      submittedTokenModel.unset(name);
    }



    //
    // SEARCH MANAGERS
    //


    var search1 = new SearchManager({
      "id": "search1",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh \"rule.groups\"=\"rootcheck\" rule.description=* | timechart span=1h count by rule.description",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search2 = new SearchManager({
      "id": "search2",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh \"rule.groups\"=\"rootcheck\" rule.cis{}=* | top  rule.cis{}",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search3 = new SearchManager({
      "id": "search3",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh \"rule.groups\"=\"rootcheck\" rule.pci_dss{}=* | top  rule.pci_dss{}",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search4 = new SearchManager({
      "id": "search4",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh \"rule.groups\"=\"rootcheck\" | timechart span=2h count by agent.name",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });

    var search5 = new SearchManager({
      "id": "search5",
      "cancelOnUnload": true,
      "sample_ratio": 1,
      "earliest_time": "$when.earliest$",
      "status_buckets": 0,
      "search": "index=wazuh sourcetype=wazuh \"rule.groups\"=\"rootcheck\" |stats count sparkline by agent.name, rule.description, title | sort count DESC | rename rule.description as \"Rule description\", agent.name as Agent, title as Control",
      "latest_time": "$when.latest$",
      "app": utils.getCurrentApp(),
      "auto_cancel": 90,
      "preview": true,
      "tokenDependencies": {
      },
      "runWhenTimeIsUndefined": false
    }, { tokens: true, tokenNamespace: "submitted" });


    //
    // SPLUNK LAYOUT
    //

    $('header').remove();
    new LayoutView({ "hideFooter": false, "hideSplunkBar": false, "hideAppBar": false, "hideChrome": false })
      .render()
      .getContainerElement()
      .appendChild($('.dashboard-body')[0]);

    //
    // DASHBOARD EDITOR
    //

    new Dashboard({
      id: 'dashboard',
      el: $('.dashboard-body'),
      showTitle: true,
      editable: true
    }, { tokens: true }).render();


    //
    // VIEWS: VISUALIZATION ELEMENTS
    //

    var element1 = new ChartElement({
      "id": "element1",
      "charting.axisY2.scale": "inherit",
      "trellis.size": "medium",
      "charting.chart.stackMode": "stacked100",
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
      "charting.legend.placement": "bottom",
      "charting.chart.bubbleSizeBy": "area",
      "charting.chart.bubbleMaximumSize": "50",
      "charting.axisLabelsX.majorLabelStyle.rotation": "0",
      "charting.axisY.scale": "linear",
      "charting.chart.showDataLabels": "none",
      "charting.chart.sliceCollapsingThreshold": "0.01",
      "managerid": "search1",
      "el": $('#element1')
    }, { tokens: true, tokenNamespace: "submitted" }).render();


    var element2 = new ChartElement({
      "id": "element2",
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
      "managerid": "search2",
      "el": $('#element2')
    }, { tokens: true, tokenNamespace: "submitted" }).render();


    var element3 = new ChartElement({
      "id": "element3",
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
      "managerid": "search3",
      "el": $('#element3')
    }, { tokens: true, tokenNamespace: "submitted" }).render();


    var element4 = new ChartElement({
      "id": "element4",
      "charting.axisY2.scale": "inherit",
      "trellis.size": "medium",
      "charting.chart.stackMode": "stacked100",
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
      "charting.legend.placement": "bottom",
      "charting.chart.bubbleSizeBy": "area",
      "charting.chart.bubbleMaximumSize": "50",
      "charting.axisLabelsX.majorLabelStyle.rotation": "0",
      "charting.axisY.scale": "linear",
      "charting.chart.showDataLabels": "minmax",
      "charting.chart.sliceCollapsingThreshold": "0.01",
      "managerid": "search4",
      "el": $('#element4')
    }, { tokens: true, tokenNamespace: "submitted" }).render();


    var element5 = new TableElement({
      "id": "element5",
      "dataOverlayMode": "heatmap",
      "drilldown": "cell",
      "percentagesRow": "false",
      "rowNumbers": "true",
      "totalsRow": "true",
      "wrap": "false",
      "managerid": "search5",
      "el": $('#element5')
    }, { tokens: true, tokenNamespace: "submitted" }).render();

    element5.on("click", function (e) {
      if (e.field !== undefined) {
        e.preventDefault();
        var url = TokenUtils.replaceTokenNames("{{SPLUNKWEB_URL_PREFIX}}/app/wazuh/search?q=index=wazuh sourcetype=wazuh \"rule.groups\"=\"rootcheck\" |stats count sparkline by agent.name, rule.description, title | sort count DESC | rename rule.description as \"Rule description\", agent.name as Agent, title as Control&earliest=$when.earliest$&latest=$when.latest$", _.extend(submittedTokenModel.toJSON(), e.data), TokenUtils.getEscaper('url'), TokenUtils.getFilters(mvc.Components));
        utils.redirect(url, false, "_blank");
      }
    });


    //
    // VIEWS: FORM INPUTS
    //

    var input1 = new TimeRangeInput({
      "id": "input1",
      "searchWhenChanged": true,
      "default": { "latest_time": "now", "earliest_time": "-24h@h" },
      "earliest_time": "$form.when.earliest$",
      "latest_time": "$form.when.latest$",
      "el": $('#input1')
    }, { tokens: true }).render();

    input1.on("change", function (newValue) {
      FormUtils.handleValueChange(input1);
    });

    DashboardController.onReady(function () {
      if (!submittedTokenModel.has('earliest') && !submittedTokenModel.has('latest')) {
        submittedTokenModel.set({ earliest: '0', latest: '' });
      }
    });

    // Initialize time tokens to default
    if (!defaultTokenModel.has('earliest') && !defaultTokenModel.has('latest')) {
      defaultTokenModel.set({ earliest: '0', latest: '' });
    }

    submitTokens();


    //
    // DASHBOARD READY
    //

    DashboardController.ready();
    pageLoading = false;

  }
);
// ]]>