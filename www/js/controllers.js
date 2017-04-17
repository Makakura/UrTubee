angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope,$timeout,$interval) {
   $scope.player;
   $scope.playerVars = {
    controls: 0,
    autoplay: 1,
    rel:0,
    showinfo:0
   };
   var promise;
   $scope.theBestVideo = 'sMKoNBRZM1M';
   $scope.$on('youtube.player.ready', function ($event, player) {
      $scope.player = player;
   });
   $scope.playClick = function(){
    $scope.player.seekTo(5,true);
    $scope.player.playVideo();
    promise = $interval(function() { 
      console.log($scope.player.getCurrentTime());
        if ($scope.player.getCurrentTime() > 7) {
         $scope.player.pauseVideo();
         $scope.stop();
      };
    }, 100);
   }
   $scope.stop = function() {
      $interval.cancel(promise);
  };
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
