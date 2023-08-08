angular.module('adopisoft')
  .component('coinflipGame', {
    bindings: {
      onsave: '&'
    },
    controller: 'CoinflipGameCtrl',
    templateUrl: '/plugins/bonus-plugin/views/admin/coinflip_game.html'
  }).controller('CoinflipGameCtrl', function($http, CatchHttpError, SettingsSavedToastr, Upload, toastr){
    var $ctrl = this;

    $ctrl.saveFile = (file, type) => {
      Upload.upload({
        url: '/bonus-plugin/settings/upload-icon',
        data: { 
          file,
          type
        }
      })
      .then((res) => {
        if(type === 'head') {
          $ctrl.head_icon =  res.data.filename;
        }
        if(type === 'tail'){
          $ctrl.tail_icon =  res.data.filename;
        }
        toastr.success('Icon saved successfully.');
      })
      .catch(CatchHttpError);
    };

    $ctrl.restoreIcon = (type) => {
      $http.post('/bonus-plugin/settings/coinflip-game/restore-icon', { type })
        .then((res) => {
        if(type === 'head') {
          $ctrl.head_icon =  res.data.filename;
        }
        if(type === 'tail'){
          $ctrl.tail_icon =  res.data.filename;
        }
        toastr.success('Icon successfully restored.');
      }).catch(e => {
        CatchHttpError(e)
      })
    }

    $ctrl.save = () => {
      $ctrl.onsave({ new_settings : { enable: $ctrl.config.enable }, req_from: 'coin_flip_game' }).then(() => {
        $ctrl.$onInit();
      })
    }

    $ctrl.$onInit = () => {
      $http.get('/bonus-plugin/settings/coinflip-game/configs').then((res) => {
        $ctrl.config = res.data;
        $ctrl.enable_game = res.data.enable

        if(res.data){
          $ctrl.head_icon = res.data.head_icon
          $ctrl.tail_icon = res.data.tail_icon
        }
      }).catch(e => {
        CatchHttpError(e)
      })
    }
  })