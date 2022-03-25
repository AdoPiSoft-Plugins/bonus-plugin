angular.module('Plugins')
  .controller('BonusCtrl', function ($http, $scope, SettingsSavedToastr, CatchHttpError) {
    function load () {
      $http.get('/bonus-plugin-settings').then(res => {
        $scope.settings = res.data
      }).catch(e => {
        CatchHttpError(e)
      })
    }

    $scope.enable_bonus = () => {
      $http.post('/bonus-plugin-settings', $scope.settings)
        .then(SettingsSavedToastr)
        .catch(CatchHttpError)
    }

    load()
  })
