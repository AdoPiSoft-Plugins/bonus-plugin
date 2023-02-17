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
      }).catch(CatchHttpError)
    }

    $ctrl.update = () => {
      $ctrl.settings.certain_amount = $ctrl.certain_cfg
      $http.post('/bonus-plugin-settings', $ctrl.settings)
      .then(SettingsSavedToastr)
      .catch(CatchHttpError)
    }

    load()
  })
})()
