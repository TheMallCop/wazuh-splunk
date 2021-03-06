define(['../../module'], function (controllers) {

  'use strict'

  controllers.controller('managerRulesetIdCtrl', function ($scope, ruleInfo, $sce, $state) {
    const vm = this
    const filters = (window.localStorage.ruleset && JSON.parse(window.localStorage.ruleset)) ? JSON.parse(window.localStorage.ruleset) : []
    const colors = [
      '#004A65', '#00665F', '#BF4B45', '#BF9037', '#1D8C2E', 'BB3ABF',
      '#00B1F1', '#00F2E2', '#7F322E', '#7F6025', '#104C19', '7C267F',
      '#0079A5', '#00A69B', '#FF645C', '#FFC04A', '#2ACC43', 'F94DFF',
      '#0082B2', '#00B3A7', '#401917', '#403012', '#2DD947', '3E1340',
      '#00668B', '#008C83', '#E55A53', '#E5AD43', '#25B23B', 'E045E5'
    ]
    vm.ruleInfo = ruleInfo.data.data.items[0]
    vm.colorRuleArg = ruleArg => {
      ruleArg = ruleArg.toString()
      let valuesArray = ruleArg.match(/\$\(((?!<\/span>).)*?\)(?!<\/span>)/gmi)
      let coloredString = ruleArg

      // If valuesArray is empty, means that the description doesn't have any arguments
      // In this case, then simply return the string
      // In other case, then colour the string and return
      if (valuesArray && valuesArray.length) {
        for (let i = 0, len = valuesArray.length; i < len; i++) {
          coloredString = coloredString.replace(/\$\(((?!<\/span>).)*?\)(?!<\/span>)/mi, '<span style="color: ' + colors[i] + ' ">' + valuesArray[i] + '</span>');
        }
      }
      return $sce.trustAsHtml(coloredString);
    }

    vm.addDetailFilter = (name, value) => {
      const filter = { name: name, value: value }
      filters.push(filter)
      window.localStorage.setItem('ruleset', JSON.stringify(filters))
      $state.go('mg-rules')
    }
  })
})