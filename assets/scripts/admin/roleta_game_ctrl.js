(function () {
  'use strict'
  angular.module('adopisoft')
    .component('roletaGame', {
      bindings: {
        onsave: '&'
      },
      controller: 'RoletaGameCtrl',
      templateUrl: '/plugins/bonus-plugin/views/admin/roleta_game.html'
    }).controller('RoletaGameCtrl', function ($http, CatchHttpError, SettingsSavedToastr, toastr, Upload, $ngConfirm) {
      var $ctrl = this
      $ctrl.has_prize_options = ['Yes', 'No']
      $ctrl.accept = ['.jpeg', '.jpg', '.png', '.ico'].join(',');

      function getConfig () {
        $ctrl.colors = ['Silver', 'Gray', 'Black', 'Red', 'Maroon', 'Olive', 'Lime', 'Green', 'Teal', 'Blue', 'Navy', 'Fuchsia', 'Purple', 'Gold', 'Orange', 'Brown', 'Dark Orange', 'Pink', 'Cyan', 'Aquamarine', 'Bisque', 'Coral', 'Deep Pink', 'Light Salmon']
        $http.get('/bonus-plugin/settings').then(d => {
          $ctrl.settings = d.data
          const roleta_game =  $ctrl.settings.roleta_game || {}
          roleta_game.prizes = roleta_game.prizes || []
          $ctrl.roleta_old_data = angular.copy(roleta_game)
          $ctrl.roleta = roleta_game
          $ctrl.sounds = $ctrl.roleta.sounds || {}
          $ctrl.optionIsRequired = !$ctrl.roleta.reset_spin_after
          $ctrl.prizes = $ctrl.roleta.prizes || []
          $ctrl.prizes.forEach(p => {
            $ctrl.colors.forEach(c => {
              if (c.toLowerCase().replace(/\s+/g, '') === p.color) {
                $ctrl.colors = $ctrl.colors.filter(cc => cc !== c)
              }
            })
          })
          $ctrl.new_prize.color = $ctrl.colors[0]
        })
      }

      $ctrl.saveFile = (file) => {
        Upload.upload({
          url: '/bonus-plugin/settings/upload-icon',
          data: { 
            file,
            game: 'roleta_game'
          }
        })
        .then((res) => {
          $ctrl.roleta.game_icon = res.data.filename;
          toastr.success('Icon saved successfully.');
        })
        .catch(CatchHttpError);
      };
  
      $ctrl.restoreIcon = () => {
        $http.post('/bonus-plugin/settings/restore-icon', { game: 'roleta_game' })
          .then((res) => {
            $ctrl.roleta.game_icon = res.data.filename;
            toastr.success('Icon successfully restored.');
          }).catch(e => {
            CatchHttpError(e)
          })
      }

      $ctrl.saveSettings = (call) => {
        const roleta_game = $ctrl.roleta
        if (call === 2) {
          let new_p = $ctrl.new_prize
          new_p.has_prize = new_p.has_prize === 'Yes'
          new_p.color = new_p.color.toLowerCase().replace(/\s+/g, '')
          if ($ctrl.selected === 'time') {
            new_p.bonus_mb = 0
            new_p.is_admin_prize = false
          } else if ($ctrl.selected === 'data') {
            new_p.bonus_minutes = 0
            new_p.is_admin_prize = false
          } else if ($ctrl.selected === 'admin_prize') {
            new_p.bonus_minutes = 0
            new_p.bonus_mb = 0
            new_p.is_admin_prize = true
          }
          if (!new_p.has_prize) {
            new_p.bonus_minutes = 0
            new_p.bonus_mb = 0
            new_p.is_admin_prize = false
          }

          roleta_game.prizes.push(new_p)
        }

        $ctrl.onsave({new_settings: roleta_game, req_from: 'roleta_game'})
          .then(() => {
            if (call !== 1) {
              toastr.success('Prize successfully added')
              $ctrl.defaultPrizeField()
            }

            getConfig()
          })
      }

      $ctrl.deletePrize = (index) => {
        let settings = $ctrl.settings
        let roleta = $ctrl.roleta
        let prizes = roleta.prizes.filter((item, indexx) => indexx !== index)

        roleta.prizes = prizes
        settings.roleta_game = roleta
        
        $http.post('/bonus-plugin/settings', settings).then(() => {
          toastr.success('Successfully deleted')
          getConfig()
        }).catch(CatchHttpError)
      }

      $ctrl.defaultPrizeField = () => {
        $ctrl.new_prize = {}
        $ctrl.new_prize.has_prize = $ctrl.has_prize_options[1]
        $ctrl.selected = ''
      }

      $ctrl.uploadIcon = (file, dir) => {
        return Upload.upload({
          url: '/bonus-plugin/settings/roleta-game/sounds',
          data: {
            file,
            dir
          }
        }).then(() => {
          getConfig()
          SettingsSavedToastr()
        }).catch(CatchHttpError)
      }

      $ctrl.deleteSound = (dir, file_name) => {
        $http.post('/bonus-plugin/settings/roleta-game/sounds/delete', {dir, file_name}).then(() => {
          toastr.success('Sound delete successfully')
          getConfig()
        }).catch(CatchHttpError)
      }

      $ctrl.resetSpin = () => {
        $ngConfirm({
          title: 'Confirm Reset',
          content: 'Are you sure you want to reset users spin?, this will reset all users spin.',
          escapeKey: 'Close',
          buttons: {
            ok: {
              text: 'Yes',
              btnClass: 'btn-danger',
              keys: ['enter'],
              action: function () {
                $http.post('/bonus-plugin/settings/roleta-game/reset-spin').then(() => {
                  toastr.success('Successfully reset users spin')
                  getConfig()
                })
              }
            },
            close: {
              text: 'Cancel',
              btnClass: 'btn-default'
            }
          }
        })
      }

      $ctrl.$onInit = () => {
        $ctrl.defaultPrizeField()
        getConfig()
      }
    })
})()
