(function () {
  'use strict'
  var App = angular.module('Plugins')
  App.component('certainAmount', {
    controller: 'CertainAmountCtrl',
    templateUrl: '/public/plugins/bonus-plugin/views/admin/certain_amount.html'
  }).controller('CertainAmountCtrl', function ($http, CatchHttpError, SettingsSavedToastr) {
    var $ctrl = this

    function load () {
      $http.get('/bonus-plugin-settings').then(res => {
        $ctrl.settings = res.data
        $ctrl.certain_amount = $ctrl.settings.certain_amount

        $ctrl.optionIsRequired = !$ctrl.certain_amount.bonus_limit_days

        if ($ctrl.certain_amount.bonus_minutes === 0) $ctrl.selected = 'data'
        if ($ctrl.certain_amount.bonus_mb === 0) $ctrl.selected = 'time'
      }).catch(CatchHttpError)
    }
    $ctrl.update = () => {
      var certain_amount = $ctrl.certain_amount
      if ($ctrl.selected === 'data') certain_amount.bonus_minutes = 0
      else if ($ctrl.selected === 'time') certain_amount.bonus_mb = 0
      $ctrl.settings.certain_amount = certain_amount

      $http.post('/bonus-plugin-settings', $ctrl.settings).then(SettingsSavedToastr).catch(CatchHttpError)
    }

    load()
  })
})()
