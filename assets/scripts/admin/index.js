(function () {
  angular.module('Plugins').config(function ($stateProvider) {
    $stateProvider.state('plugins.bonus_plugin', {
      templateUrl: '/plugins/bonus-plugin/views/admin/admin.html',
      url: '/bonus-plugin',
      title: 'Bonus Plugin',
      controller: 'BonusCtrl',
      sidebarMeta: {
        order: 2,
        icon: "fa fa-gift",
        text: "Bonus Plugin",
        href: "plugins.bonus_plugin"
      }
    })
  })
})()
