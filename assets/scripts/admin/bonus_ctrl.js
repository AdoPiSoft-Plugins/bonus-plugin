angular.module('Plugins')
  .controller('BonusCtrl', function ($http, $scope, SettingsSavedToastr, CatchHttpError) {
    $scope.reload = function() {
      $http.get('/bonus-plugin-settings').then(res => {
        $scope.settings = res.data
      }).catch(e => {
        CatchHttpError(e)
      })
    }
    $scope.$watch('settings.enable_bonus', function (val, oldVal) {
      if (val == null || oldVal === null || oldVal === undefined) return
      $http.post('/bonus-plugin-settings', $scope.settings).then(SettingsSavedToastr).catch(CatchHttpError)
    })

    $scope.reload()
  })
