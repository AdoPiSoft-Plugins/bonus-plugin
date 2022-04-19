angular.module('adopisoft')
  .directive('roletaAudioBtn', function () {
    return {
      restrict: 'AE',
      scope: {
        fileName: '=',
        dir: '='
      },
      replace: true,
      transclude: true,
      templateUrl: '/public/plugins/bonus-plugin/views/admin/roleta_audio_btn.html',
      link: function ($scope, elem) {
        var sound

        $scope.togglePlay = () => {
          if ($scope.playing) $scope.stop()
          else $scope.play()
        }

        $scope.play = () => {
          const sound_url = '/plugins/bonus-plugin/assets/sounds/' + $scope.dir + '/' + $scope.fileName
          sound = new Howl({src: sound_url})
          $scope.playing = true
          sound.play()
          sound.on('end', () => {
            $scope.$apply(() => {
              $scope.playing = false
              sound = null
            })
          })
        }
        $scope.stop = () => {
          if (sound) sound.stop()
          $scope.playing = false
          sound = null
        }

        $scope.$on('$destroy', () => {
          console.log('stop')
          $scope.stop()
        })
      }
    }
  })
