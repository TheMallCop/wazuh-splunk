/*
 * Wazuh app - Agents controller
 * Copyright (C) 2018 Wazuh, Inc.
 *
 * This program is free software you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

define(['../../module'], function (controllers) {

  'use strict'

  controllers.controller('agentsOverviewCtrl', function ($stateParams, $state, agent) {
    const vm = this
    try {
      vm.agent = agent[0].data.data
      vm.agentOS = `${vm.agent.os.name} ${vm.agent.os.codename} ${vm.agent.os.version}`
      vm.syscheck = agent[1].data.data
      vm.id = $stateParams.id
      vm.rootcheck = agent[2].data.data
    } catch (err) {
      $state.go('agents')
    }

    vm.goGroups = async (group) => {
      try {
        const groupInfo = await $requestService.apiReq(`/groups`, { name: group })
        if (!groupInfo || !groupInfo.data || !groupInfo.data.data || groupInfo.data.error)
          throw Error('Error')
        $state.go(`group-overview`, { id: `${groupInfo.data.data.id}` })
      } catch (err) {
        $notificationService.showSimpleToast('Error fetching group data')
      }
    }

    vm.formatAgentStatus = agentStatus => {
      return ['Active', 'Disconnected'].includes(agentStatus) ? agentStatus : 'Never connected';
    }
    vm.getAgentStatusClass = agentStatus => agentStatus === "Active" ? "teal" : "red";
  })
})