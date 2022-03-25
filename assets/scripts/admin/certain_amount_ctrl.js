(function () {
  'use strict'
  var App = angular.module('Plugins')
  App.component('certainAmount', {
    controller: 'CertainAmountCtrl',
    templateUrl: '/plugins/bonus-plugin/views/admin/certain_amount.html'
  }).controller('CertainAmountCtrl', function ($http, CatchHttpError, SettingsSavedToastr) {
    var $ctrl = this

    function load () {
      $http.get('/bonus-plugin-settings').then(res => {
        $ctrl.settings = res.data
        $ctrl.config = $ctrl.settings

        $ctrl.optionIsRequired = !$ctrl.config.bonus_limit_days

        if ($ctrl.config.bonus_minutes === 0) $ctrl.selected = 'data'
        if ($ctrl.config.bonus_mb === 0) $ctrl.selected = 'time'
      }).catch(CatchHttpError)
    }
    $ctrl.update = () => {
      var config = $ctrl.config
      if ($ctrl.selected === 'data') config.bonus_minutes = 0
      else if ($ctrl.selected === 'time') config.bonus_mb = 0
      config.bonus_type = 'certain_amount'
      $ctrl.settings = config

      $http.post('/bonus-plugin-settings', $ctrl.settings).then(SettingsSavedToastr).catch(CatchHttpError)
    }

    load()
  })
})()
