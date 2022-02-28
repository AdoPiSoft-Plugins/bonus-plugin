(function () {
  angular.module('Plugins').config(function($stateProvider){
    $stateProvider.state('plugins.bonus_plugin', {
      templateUrl: '/public/plugins/bonus-plugin/views/admin/admin.html',
      url: '/bonus-plugin',
      title: 'Bonus Plugin',
      controller: 'BonusCtrl as $ctrl'
    })
  })
})()
