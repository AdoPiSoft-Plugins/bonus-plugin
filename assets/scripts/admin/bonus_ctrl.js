angular.module('Plugins')
  .controller('BonusCtrl', function ($http, $scope, SettingsSavedToastr, CatchHttpError, $q) {
    $scope.reload = function() {
      $http.get('/bonus-plugin/settings').then(res => {
        $scope.settings = res.data
      }).catch(e => {
        CatchHttpError(e)
      })
    }
    $scope.$watch('settings.enable_bonus', function (val, oldVal) {
      if (val == null || oldVal === null || oldVal === undefined) return
      $scope.onSave($scope.settings.enable_bonus, 'enable_bonus')
    })

    $scope.onSave = (new_settings, req_from) => {
      var d = $q.defer()
      $http.get('/bonus-plugin/settings').then(res => {
        const configs = res.data
        if (req_from === 'enable_bonus') configs.enable_bonus = new_settings
        else if (req_from === 'roleta_game') configs.roleta_game = new_settings
        else if (req_from === 'certain_amount') configs.certain_amount = new_settings
        else if (req_from === 'flip_game') configs.flip_game = new_settings

        $http.post('/bonus-plugin/settings', configs)
        .then(SettingsSavedToastr)
        .catch(CatchHttpError)
        .finally(() => d.resolve(true))
      })

      return d.promise
    }

    $scope.reload()
  })
