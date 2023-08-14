angular.module('adopisoft')
  .component('flipGame', {
    bindings: {
      onsave: '&'
    },
    controller: 'FlipGameCtrl',
    templateUrl: '/plugins/bonus-plugin/views/admin/flip_game.html'
  }).controller('FlipGameCtrl', function($http, CatchHttpError, Upload, toastr){
    var $ctrl = this;
    $ctrl.chance_of_winnings = ['10%', '20%', '30%', '40%', '50%', '60%']
    $ctrl.accept = ['.jpeg', '.jpg', '.png', '.ico'].join(',');

    $ctrl.saveFile = (file, type) => {
      Upload.upload({
        url: '/bonus-plugin/settings/upload-icon',
        data: { 
          file,
          type
        }
      })
      .then((res) => {
        if(type === 'first-choice') {
          $ctrl.first_choice_icon =  res.data.filename;
        }
        if(type === 'second-choice'){
          $ctrl.second_choice_icon =  res.data.filename;
        }
        toastr.success('Icon saved successfully.');
      })
      .catch(CatchHttpError);
    };

    $ctrl.restoreIcon = (type) => {
      $http.post('/bonus-plugin/settings/restore-icon', { type })
        .then((res) => {
        if(type === 'first-choice') {
          $ctrl.first_choice_icon =  res.data.filename;
        }
        if(type === 'second-choice'){
          $ctrl.second_choice_icon =  res.data.filename;
        }
        toastr.success('Icon successfully restored.');
      }).catch(e => {
        CatchHttpError(e)
      })
    }

    $ctrl.save = () => {
      $ctrl.onsave(
        { 
          new_settings : {
            enable: $ctrl.config.enable,
            first_choice_text: $ctrl.config.first_choice_text,
            second_choice_text: $ctrl.config.second_choice_text,
            min_mins_session:  $ctrl.config.min_mins_session,
            min_mb_session: $ctrl.config.min_mb_session,
            chance_of_winning: $ctrl.config.chance_of_winning
          }, 
          req_from: 'flip_game' 
        }).then(() => {
        $ctrl.$onInit();
      })
    }

    $ctrl.$onInit = () => {
      $http.get('/bonus-plugin/flip-game/settings/config').then((res) => {
        $ctrl.config = res.data;
        $ctrl.enable_game = res.data.enable
        if(res.data){
          $ctrl.first_choice_icon = res.data.first_choice_icon
          $ctrl.second_choice_icon = res.data.second_choice_icon
        }
      }).catch(e => {
        CatchHttpError(e)
      })
    }
  })