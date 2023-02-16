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
        $ctrl.certain_cfg = $ctrl.settings.certain_amount || {}

        $ctrl.optionIsRequired = !$ctrl.certain_cfg.bonus_limit_days

        if ($ctrl.certain_cfg.bonus_minutes === 0) $ctrl.selected = 'data'
        if ($ctrl.certain_cfg.bonus_mb === 0) $ctrl.selected = 'time'
      }).catch(CatchHttpError)
    }

    $ctrl.update = () => {
      var certain_cfg = $ctrl.certain_cfg
      if ($ctrl.selected === 'data') certain_cfg.bonus_minutes = 0
      else if ($ctrl.selected === 'time') certain_cfg.bonus_mb = 0
      $ctrl.settings.certain_amount = certain_cfg
    
      $http.post('/bonus-plugin-settings', $ctrl.settings).then(SettingsSavedToastr).catch(CatchHttpError)
    }

    load()
  })
})()
