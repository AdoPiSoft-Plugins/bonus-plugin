(function () {
  'use strict'
  var App = angular.module('Plugins')
  App.component('certainAmount', {
    controller: 'CertainAmountCtrl',
    templateUrl: '/public/plugins/bonus-plugin/views/admin/certain_amount.html'
  }).controller('CertainAmountCtrl', function ($http, CatchHttpError, SettingsSavedToastr) {
    var $ctrl = this

    function load () {
      $http.get('/bonus-plugin').then(res => {
        $ctrl.settings = res.data
        $ctrl.certain_amount = $ctrl.settings.certain_amount

        $ctrl.optionIsRequired = !$ctrl.certain_amount.bonus_limit_days

        if ($ctrl.certain_amount.bonus_minutes === 0) $ctrl.selected = 'data'
        if ($ctrl.certain_amount.bonus_mb === 0) $ctrl.selected = 'time'
      }).catch(CatchHttpError)
    }

    $ctrl.selectChange = () => {
      $ctrl.optionIsRequired = false

      if ($ctrl.certain_amount.bonus_limit_days === 'today') {
        $ctrl.certain_amount.bonus_from_date = moment().startOf('day').toDate()
        $ctrl.certain_amount.bonus_to_date = moment().endOf('day').toDate()
      } else if ($ctrl.certain_amount.bonus_limit_days === '1_week') {
        $ctrl.certain_amount.bonus_from_date = moment().startOf('day').toDate()
        $ctrl.certain_amount.bonus_to_date = moment().add(6, 'day').endOf('day').toDate()
      } else if ($ctrl.certain_amount.bonus_limit_days === '2_weeks') {
        $ctrl.certain_amount.bonus_from_date = moment().startOf('day').toDate()
        $ctrl.certain_amount.bonus_to_date = moment().add(13, 'day').endOf('day').toDate()
      } else if ($ctrl.certain_amount.bonus_limit_days === '1_month') {
        $ctrl.certain_amount.bonus_from_date = moment().startOf('day').toDate()
        $ctrl.certain_amount.bonus_to_date = moment().add(29, 'day').endOf('day').toDate()
      }
    }
    $ctrl.update = () => {
      var certain_amount = $ctrl.certain_amount
      if ($ctrl.selected === 'data') certain_amount.bonus_minutes = 0
      else if ($ctrl.selected === 'time') certain_amount.bonus_mb = 0
      $ctrl.settings.certain_amount = certain_amount

      $http.post('/bonus-plugin', $ctrl.settings).then(SettingsSavedToastr).catch(CatchHttpError)
    }

    load()
  })
})()
