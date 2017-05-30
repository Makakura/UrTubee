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
   // $cordovaSQLite.execute(db, 'DROP TABLE Sentences');
    $cordovaSQLite.execute(db, 
    'CREATE TABLE IF NOT EXISTS Sentences '+
    '(id INTEGER PRIMARY KEY AUTOINCREMENT,'+
    ' sentence TEXT, videoId TEXT, videoTitle TEXT, point INTERGER)');
    
    $cordovaSQLite.execute(db, 
    'CREATE TABLE IF NOT EXISTS Videos '+
    '(id TEXT PRIMARY KEY, title TEXT, sub TEXT, dt TEXT, thumbnail TEXT)');
     
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
  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })
   .state('tab.recent', {
    url: '/recent',
    views: {
      'tab-recent': {
        templateUrl: 'templates/tab-recent.html',
        controller: 'RecentCtrl'
      }
    }
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

  .state('tab.sentence', {
      url: '/sentence',
      views: {
        'tab-sentence': {
          templateUrl: 'templates/tab-sentences.html',
          controller: 'SentenceCtrl'
        }
      }
    })

  .state('tab.practice', {
    url: '/practice',
    views: {
      'tab-practice': {
        templateUrl: 'templates/tab-practice.html',
        controller: 'PracticeCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});
