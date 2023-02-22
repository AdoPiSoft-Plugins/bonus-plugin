angular.module('adopisoft')
  .component('bonusLogs', {
    controller: 'BonusLogsCtrl',
    templateUrl: '/plugins/bonus-plugin/views/admin/bonus_logs.html'
  }).controller('BonusLogsCtrl', function($scope, $http, CatchHttpError, toastr, $ngConfirm) {
    const logs_url = '/bonus-plugin-settings/get-bonus-logs'
    $scope.currentPage = 1
    $scope.perPage = 25
    $scope.totalItems = 0
    $scope.maxSize = 5

    $scope.loadLogs = () => {
      const params = {
        page: $scope.currentPage,
        perPage: $scope.perPage,
        q: $scope.q
      }

      $http.get(logs_url, { params })
        .then(({data}) =>{
          $scope.bonus_logs = data.bonus_logs
          $scope.totalItems = data.total
        }).catch(CatchHttpError)
    }

    $scope.clearLogs = () => {
      $ngConfirm({
        title: 'Confirm!',
        content: 'Are you sure you want to clear bonus logs ?',
        escapeKey: 'Close',
        buttons: {
          ok: {
            text: 'Clear',
            btnClass: 'btn-danger',
            keys: ['enter'],
            action: function () {
              $http.delete('/bonus-plugin-settings/clear-bonus-logs')
                .then(() => {
                  toastr.success('Bonus logs successfully cleared')
                  $scope.loadLogs()
                })
                .catch(CatchHttpError)
            }
          },
          close: {
            text: 'Cancel',
            btnClass: 'btn-default'
          }
        }
      })
    }


    $scope.loadLogs()

  })