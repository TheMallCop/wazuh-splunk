define([
  '../module',
], function (
  controllers
) {
    'use strict'
    controllers.controller('settingsApiCtrl', function ($scope, $currentDataService, apiList, $notificationService) {
      const vm = this
      vm.addManagerContainer = false
      vm.isEditing = false
      vm.showForm = (apiList.length === 0) ? true : false
      vm.entry = {}
      vm.currentEntryKey = ''
      const epoch = (new Date).getTime()
      // Validation RegEx
      const userRegEx = new RegExp(/^.{3,100}$/)
      const passRegEx = new RegExp(/^.{3,100}$/)
      const urlRegEx = new RegExp(/^https?:\/\/[a-zA-Z0-9-.]{1,300}$/)
      const urlRegExIP = new RegExp(/^https?:\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/)
      const portRegEx = new RegExp(/^[0-9]{2,5}$/)
      /**
       * Initializes the controller
       */
      vm.init = async () => {
        try {
          // If no API, then remove cookie
          if (Array.isArray(apiList) && apiList.length === 0) {
            $currentDataService.removeCurrentApi()
            $scope.$emit('updatedAPI', () => { })
          }

          vm.apiList = apiList

          let currentApi = $currentDataService.getApi()

          if (!currentApi && Array.isArray(vm.apiList)) {
            for (const apiEntry of vm.apiList) {
              try {
                await vm.selectManager(apiEntry.id)
                // setAPI
                currentApi = $currentDataService.getApi()
                break
              } catch (error) { }
            }
          }

          vm.apiList.map(item => { delete item.selected })

          if (currentApi) {
            vm.apiList.map(item => {
              if (item.id === currentApi.id) {
                item.selected = true
              }
            })
          }
        } catch (err) {
          $notificationService.showSimpleToast('Error loading data')
        }
      }

      /**
       * Removes an API from the list
       * @param {Object} entry 
       */
      vm.removeManager = async (entry) => {
        try {
          const currentApi = $currentDataService.getApi()
          if (currentApi && currentApi.id === entry.id) {
            $notificationService.showSimpleToast('Cannot delete selected API')
          } else {
            const index = vm.apiList.indexOf(entry)
            if (index > -1) {
              vm.apiList.splice(index, 1)
              await $currentDataService.remove(entry)
            }
            $notificationService.showSimpleToast('Manager was removed')
          }
        } catch (err) {
          $notificationService.showSimpleToast('Cannot remove API:', err.message || err)
        }
      }

      /**
       * Check API connectivity
       * @param {Object} entry 
       */
      vm.checkManager = async (entry) => {
        try {
          const connectionData = await $currentDataService.checkApiConnection(entry.id)
          for (let i = 0; i < vm.apiList.length; i++) {
            if (vm.apiList[i].id === entry.id) {
              vm.apiList[i] = connectionData
              break
            }
          }
          $notificationService.showSimpleToast('Established connection')
          if (!$scope.$$phase) $scope.$digest()

        } catch (err) {
          $notificationService.showSimpleToast('Unreachable API')
        }
      }

      /**
       * Set form visible
       */
      vm.addNewApiClick = () => {
        vm.showForm = !vm.showForm
        vm.edit = false
      }

      /**
       * Shows form for editting an API entry
       * @param {Object} entry 
       */
      vm.editEntry = (entry) => {
        try {
          vm.edit = !vm.edit
          vm.showForm = false
          vm.currentEntryKey = entry.id
          vm.url = entry.url
          vm.pass = entry.pass
          vm.port = entry.portapi
          vm.user = entry.userapi
          vm.managerName = entry.managerName
          vm.filterType = entry.filterType
          vm.filterName = entry.filterName
          vm.entry.url = entry
        } catch (err) {
          $notificationService.showSimpleToast('Could not open API form')
        }
      }

      /**
       * Edits an entry
       * @param {Object} entry 
       */
      vm.updateEntry = async () => {
        try {
          vm.edit = !vm.edit
          vm.showForm = false
          vm.entry.url = vm.url
          vm.entry.portapi = vm.port
          vm.entry.userapi = vm.user
          vm.entry.passapi = vm.pass
          vm.entry.filterType = vm.filterType
          vm.entry.filterName = vm.filterName
          vm.entry.managerName = vm.managerName
          vm.entry.id = vm.currentEntryKey

          // const resultNewApi = await $currentDataService.checkRawConnection(vm.entry)
          // if (resultNewApi.data.error) {
          //   $notificationService.showSimpleToast('Unreachable API. Cannot update')
          //   return
          // }
          delete vm.entry['$$hashKey']
          await $currentDataService.checkRawConnection(vm.entry)
          await $currentDataService.update(vm.entry)
          const updatedApi = await $currentDataService.checkApiConnection(vm.entry.id)

          // const updatedEntry = await $currentDataService.checkApiConnection(vm.currentEntryKey)

          for (let i = 0; i < vm.apiList.length; i++) {
            if (vm.apiList[i].id === updatedApi.id) {
              vm.apiList[i] = updatedApi
            }
          }
          if (!$scope.$$phase) $scope.$digest()

          if ($currentDataService.getApi() && $currentDataService.getApi().id === vm.entry.id) {
            vm.selectManager(updatedEntry.data)
          }

          vm.edit = false
          $notificationService.showSimpleToast('Updated API')
        } catch (err) {
          $notificationService.showSimpleToast('Cannot update API')
        }
      }

      /**
       * Check if an URL is valid or not
       * @param {String} url 
       */
      const validUrl = url => {
        return urlRegEx.test(url) || urlRegExIP.test(url)
      }

      /**
       * Check if a port is valid or not
       * @param {String} port 
       */
      const validPort = port => {
        return portRegEx.test(port)
      }

      /**
       * Check if an user is valid or not
       * @param {String} user 
       */
      const validUsername = user => {
        return userRegEx.test(user)
      }

      /**
       * Check if a password is valid or not
       * @param {String} pass 
       */
      const validPassword = pass => {
        return passRegEx.test(pass)
      }

      /**
       * Empties the form fields
       */
      const clearForm = () => {
        vm.url = ''
        vm.port = ''
        vm.user = ''
        vm.pass = ''
      }

      /**
       * Select an API as the default one
       * @param {Object} entry 
       */
      vm.selectManager = async (entry) => {
        try {
          const connectionData = await $currentDataService.checkApiConnection(entry)
          await $currentDataService.chose(entry)
          vm.apiList.map(api => api.selected = false)
          for (let item of vm.apiList) {
            if (item.id === entry) {
              if (connectionData.cluster) {
                item.cluster = connectionData.cluster
              } else {
                item.cluster = 'Disabled'
              }
              item.managerName = connectionData.managerName
              item.selected = true
            }
          }
          $notificationService.showSimpleToast('API selected')
          $scope.$emit('updatedAPI', () => { })
          if (!$scope.$$phase) $scope.$digest()
        } catch (err) {
          $notificationService.showSimpleToast('Could not select manager')
        }
      }

      /**
       * Adds a new API
       */
      vm.submitApiForm = async () => {
        try {
          // When the Submit button is clicked, get all the form fields by accessing to the input values
          const form_url = vm.url
          const form_apiport = vm.port
          const form_apiuser = vm.user
          const form_apipass = vm.pass

          // If values are not valid then throw an error
          if (!validPassword(form_apipass) || !validPort(form_apiport) || !validUrl(form_url) || !validUsername(form_apiuser))
            throw new Error('Invalid format. Please check the fields again')

          // Create an object to store the field names and values
          const record = {
            "url": form_url,
            "portapi": form_apiport,
            "userapi": form_apiuser,
            "passapi": form_apipass,
          }

          // If connected to the API then continue
          await $currentDataService.checkRawConnection(record)

          // Get the new API database ID
          const { result } = await $currentDataService.insert(record)
          const id = result
          try {
            // Get the full API info
            const api = await $currentDataService.checkApiConnection(id)
            // Empties the form fields
            clearForm()

            // If the only one API in the list, then try to select it
            vm.apiList.push(api)
            if (apiList && apiList.length === 1) {
              await vm.selectManager(id)
            }
            vm.showForm = false
            if (!$scope.$$phase) $scope.$digest()
            $notificationService.showSimpleToast('API was added')

          } catch (err) {
            $currentDataService.remove(id).then(() => { }).catch((err) => { $notificationService.showSimpleToast('Unexpected error') })
            $notificationService.showSimpleToast('Unreachable API')
          }

        } catch (err) {
          $notificationService.showSimpleToast(err.message)
        }
      }

      vm.init()
    })
  })

