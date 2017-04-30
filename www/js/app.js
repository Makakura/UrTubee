var db = null;
angular.module('app', ['ionic', 'app.controllers', 'app.services','youtube-embed', 'ngCordova'])
.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
     try {
        if (window.cordova) {
        db = $cordovaSQLite.openDB({name:"nextflow.db",location:'default'});
        console.log("Android");
    }else{
        db = window.openDatabase("nextflow.db", '1', 'nextflow', 1024 * 1024 * 100); // browser
        console.log("Browser");
    } 
    } catch (error) {
        alert(error);
    }
    $cordovaSQLite.execute(db, 
    'CREATE TABLE IF NOT EXISTS Sentences '+
    '(id INTEGER PRIMARY KEY AUTOINCREMENT,'+
    ' sentence TEXT, videoId TEXT, videoTitle TEXT)');
    $cordovaSQLite.execute(db, 
    'CREATE TABLE IF NOT EXISTS Videos '+
    '(id INTEGER PRIMARY KEY AUTOINCREMENT,'+
    'videoId TEXT, videoTitle TEXT, sub TEXT)');
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom'); // other values: top
  $stateProvider
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  .state('tab.videoplayer', {
    url: '/videoplayer',
    views: {
      'tab-dash': {
        templateUrl: 'templates/videoplayer.html',
        controller: 'VideoPlayerCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-list-sentences.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/videoplayer');

});
