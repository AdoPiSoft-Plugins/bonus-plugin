(function () {
  'use strict'
  var App = angular.module('Plugins')
  App.component('certainAmount', {
    bindings: {
      onsave: '&'
    },
    controller: 'CertainAmountCtrl',
    templateUrl: '/plugins/bonus-plugin/views/admin/certain_amount.html'
  }).controller('CertainAmountCtrl', function ($scope, $http, CatchHttpError, SettingsSavedToastr) {
    var $ctrl = this

    function load () {
      $http.get('/bonus-plugin/settings').then(res => {
        $ctrl.settings = res.data
        $ctrl.certain_cfg = $ctrl.settings.certain_amount || {}
        $ctrl.optionIsRequired = !$ctrl.certain_cfg.bonus_limit_days
      }).catch(CatchHttpError)

    }

    $ctrl.update = () => {
      $ctrl.onsave({new_settings: $ctrl.certain_cfg, req_from: 'certain_amount'})
        .then(() => load())
    }

    $ctrl.$onInit = () => {
      load()
    }

  })
})()
