angular.module('app.controllers', [])

.controller('VideoPlayerCtrl', 
function($scope, $timeout, $interval, SubService, 
$location, $ionicScrollDelegate, SentenceService) {
   $scope.player;
   $scope.isScrolling = false;
   $scope.curSubItem = {};
   $scope.playerHeight = '210px';
   $scope.curVideo = {
     id: '8jPQjjsBbIc',
     title: 'abcd',
     sub: {}
   };
   $scope.playerVars = {
    controls: 1,
    autoplay: 1,
    rel:0,
    showinfo:0
   };
   $scope.theBestVideo = $scope.curVideo.id;
   var promise;
   function secondsToHms(d) {
      d = Number(d);
      var h = Math.floor(d / 3600);
      var m = Math.floor(d % 3600 / 60);
      var s = Math.floor(d % 3600 % 60);
      if (h<=0)
      return ('0'+ m).slice(-2) + ":" + ('0'+ s).slice(-2); 
      else
      return ('0'+ h).slice(-2) + ":" + ('0'+ m).slice(-2) + ":" + ('0'+ s).slice(-2);
    }

   $scope.$on('$ionicView.enter', function(ev) {
     $scope.playerHeight = (document.getElementById('player').clientHeight -38) + 'px';
     console.log(document.getElementById('player').clientHeight);
      SubService.getSub($scope.curVideo.id)
      .then(
       function success(data){
         data.forEach(function(item,index) {
           item.__text = item.__text.replace(/&#39;/g, '\'');
           item.__text= item.__text.charAt(0).toUpperCase() + item.__text.slice(1);
           var start = parseFloat(item._start);
           item._start = parseFloat(item._start).toFixed(1);
           var dur = parseFloat(item._dur);
           item.totalTime = start+dur;
           item.timeStart = secondsToHms(start.toFixed(0));
           /*
           if((start+dur)>60)
           {
             item.timeStart='';
             if(start>3600){ //hour
               item.timeStart = '0'+start/3600 + ':';
             }
             if(start>=600){ // min
               item.timeStart += (start/60).toFixed(0) + ':';
             }
             else{
               item.timeStart += '0'+ (start/60).toFixed(0) + ':';
             }
             if((start % 60).toFixed(0) >=10){ //sec
               item.timeStart += (start % 60).toFixed(0);
             }else{
              item.timeStart += '0' + (start % 60).toFixed(0);
             }
           }
           else
           if((start+dur)>=10){
             item.timeStart = '0:' + start.toFixed(0);
           }
           else{
             item.timeStart = '0:0' + start.toFixed(0);
           }*/
         });
        $scope.curVideo.sub = data;
       },
       function error(msg){
        console.log(msg);
      });
   });

   $scope.$on('$ionicView.leave', function(ev) {
      $scope.stop();
      $scope.player.stopVideo();
   });

   $scope.$on('youtube.player.ready', function ($event, player) {
      $scope.player = player;
      
   });

   $scope.$on('youtube.player.playing', function ($event, player) {
       promise = $interval(function() { 
         var curTime = parseFloat($scope.player.getCurrentTime().toFixed(1));
         var BreakException = {};
         try {
         $scope.curVideo.sub.forEach(function(item, index){
           
            if(secondsToHms(curTime.toFixed(0)) == item.timeStart){
              console.log($scope.isScrolling);
              console.log( 'jump to: ' + curTime);
              $scope.curSubItem = item;
              console.log('cur item: ' + item.__text);
              $location.hash(item.timeStart);      
              $ionicScrollDelegate.anchorScroll(); 
              throw BreakException;
            }
            
         })
         } catch (e) {
            
          }
    },1000);
   });
   $scope.$on('youtube.player.paused', function ($event, player) {
      console.log( 'Stop!');
      $scope.stop();
   });
   
   $scope.stop = function() {
      $interval.cancel(promise);
  };

  $scope.timeClick = function(item){
    $scope.stop();
    $scope.curSubItem= item;
    $scope.player.seekTo((item._start-0.5),true);
    $location.hash(item.timeStart);      
    $ionicScrollDelegate.anchorScroll(); 
    console.log($scope.player.getAvailablePlaybackRates());
    $scope.player.playVideo();
  }
  $scope.playerClick = function(){
    if (player.getPlayerState()==1)
     $scope.player.pauseVideo();
     else
     $scope.player.playVideo();
  }
  $scope.addItem = function(item){
    SentenceService.add(item.__text, $scope.curVideo).then(
    function(res){
      console.log(res);
    },function(err){
        console.log(err);
    });
  }
})

.controller('ChatsCtrl', function($scope,SentenceService) {
  $scope.Sentences = [];
   $scope.$on('$ionicView.enter', function(ev) {
     $scope.loadAll();
   });
  $scope.loadAll = function(){
    SentenceService.getAll().then(
      function(res){
        $scope.Sentences = res;
        console.log(res);
    },function(err){
        console.log(err);
    }
    );
  }

})

.controller('ChatDetailCtrl', function($scope, $stateParams) {
})

.controller('AccountCtrl', function($scope, $ionicPlatform,$rootScope) {
  $scope.isRecording = false;
  var recognition = '';
  
  $scope.recognizedText = "";
    
  $scope.record = function() {
    // recognition = new webkitSpeechRecognition(); //To Computer
      recognition = new SpeechRecognition(); // To Device
      recognition.lang = 'en-GB';
      recognition.onresult = function(event) {
        $scope.isRecording = false;
        $scope.recognizedText = "";
        console.log("KQ: " + event.results.length);
          if (event.results.length > 0) {
              $scope.recognizedText = event.results[0][0].transcript;
              $scope.$apply();
          }
      };
      recognition.onerror = function(event) {
         $scope.recognizedText = "Không nhận được giọng nói, vui lòng thử lại";
      }
      recognition.start();
      $scope.isRecording = true;
      $scope.recognizedText = "Recording...";
           
  };
  $scope.stopRecord = function(){
    recognition.stop();    
    $scope.isRecording = false;
    $scope.recognizedText = "";
  }
  
});