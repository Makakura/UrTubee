angular.module('app.controllers', [])

.controller('DashCtrl', function($scope, YoutubeService, $state){
  $scope.videos = [];
  // when go Dash
  $scope.$on('$ionicView.enter', function(ev) {
    $scope.videos = YoutubeService.getAllVideo();
  })
  // video click
  $scope.videoClick = function(video){
    YoutubeService.setIsSeekToSub(false);
    YoutubeService.setCurSub(null);
    YoutubeService.setCurVideo(video);
  }
})
.controller('RecentCtrl', function($scope, YoutubeService,$ionicPopup){
  $scope.videos = [];
  $scope.searchStr = '';
  $scope.resultVideo = {};
  $scope.resultSub = {};
  $scope.filterStr = '';
  $scope.isSearched = false;
  $scope.isFounded = false;
  $scope.isFoundedByAdvance = false;
   $scope.$on('$ionicView.enter', function(ev) {
     $scope.loadAll();
   });
  $scope.loadAll = function(){
    YoutubeService.getAllRecent().then(
      function(res){
        $scope.videos = res;
    },function(err){
    }
    );
  }
  $scope.clearRecent = function(){
    var confirmPopup = $ionicPopup.confirm({
       title: 'Clear All Recent',
       template: 'Are you sure to remove all recent videos ?'
     });
     confirmPopup.then(function(res) {
       if(res) {
        YoutubeService.clearRecent();
      $scope.videos = [];
       } else {
       }
     });
     
  }
  $scope.remove = function(item){
    YoutubeService.deleteRecentVideo(item.id);
    $scope.videos.splice($scope.videos.indexOf(item), 1);
  }
  $scope.search = function(){
    if($scope.isSearched)
    {
      $scope.searchStr = '';
      $scope.isSearched = false;
      $scope.filterStr = '';
      $scope.isFounded = false;
      isFoundedByAdvance = false; 
      return;
    }
    isFounded = false;
    isFoundedByAdvance = false; 
    var BreakException = {};
    try{
      $scope.videos.forEach(function(item, index) {
        var subArr = JSON.parse(item.sub);
        subArr.forEach(function(subItem, subIndex) {  
        var textTemp ='';
        textTemp = subItem.__text.toLowerCase()
                                  .replace(/(\r\n|\n|\r)/gm," ")
                                  .replace(/  +/g, ' ') .replace('.', '');
        console.log(textTemp);  
        if (textTemp.indexOf($scope.searchStr.toLowerCase()) >-1){    
          console.log('Look');      
          isFounded = true;   
          isFoundedByAdvance = false;                     
          $scope.resultVideo = item;
          $scope.resultSub = subItem;
          throw BreakException;
        }
        // search advance
         if(subIndex != subArr.length) {
          textTemp = subItem.__text.toLowerCase()
                                    .replace(/(\r\n|\n|\r)/gm," ")
                                    .replace(/  +/g, ' ')
                                    .replace('.', '')
                                    .replace(',', '');
          textTemp = textTemp + ' ' +subArr[subIndex + 1].__text.toLowerCase()
                                                          .replace(/(\r\n|\n|\r)/gm," ")
                                                          .replace(/  +/g, ' ')
                                                          .replace('.', '')
                                                          .replace(',', '');
        }
        if (textTemp.indexOf($scope.searchStr.toLowerCase()) >-1){    
          console.log('Look advance');       
          isFounded = true; 
          isFoundedByAdvance = true;                      
          $scope.resultVideo = item;
          subItem.__text = textTemp;
          $scope.resultSub = subItem;
          throw BreakException;
        }   
        });
      });
    } catch (e) {
    }
    $scope.isSearched = true;
     if(isFounded){
      $scope.filterStr = $scope.resultVideo.id;
      }
      else{
        $scope.filterStr = $scope.searchStr;
      }
      console.log($scope.filterStr);
  }
  $scope.searchChange = function(){
    $scope.isSearched = false;
    $scope.isFounded = false;
    isFoundedByAdvance = false; 
  }
  $scope.videoClick = function(video){
    if($scope.isSearched)
    {
      console.log ('seek to sub');
      var tempVideo = $scope.resultVideo;
      delete tempVideo['sub'];
      YoutubeService.setIsSeekToSub(true);
      YoutubeService.setCurSub($scope.resultSub);
      YoutubeService.setCurVideo(tempVideo);
    }
    else
    {
      console.log (' non seek to sub');      
      var tempVideo = video;
      delete tempVideo['sub'];
      YoutubeService.setIsSeekToSub(false);
      YoutubeService.setCurSub(null);
      YoutubeService.setCurVideo(tempVideo);
    }
  }
})
.controller('VideoPlayerCtrl', 
function($scope, $timeout, $interval, YoutubeService, 
$location, $ionicScrollDelegate, SentenceService) {
   $scope.player;
   $scope.isScrolling = false;
   $scope.curSubItem = {};
   $scope.playerHeight = '210px';
   $scope.curVideo = {
     id: '',
     title: '',
     thumbnail:'',
     time:'',
     sub: {}
   };
   $scope.playerVars = {
    controls: 1,
    autoplay: 1,
    rel:0,
    showinfo:1
   };
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
      var now = new Date();
      //Get cur video
      $scope.curVideo = YoutubeService.getCurVideo();
      $scope.theBestVideo = $scope.curVideo.id;
      //Set player height
      $scope.playerHeight = (document.getElementById('player').clientHeight) + 'px';
      //Get sub
      YoutubeService.getSub($scope.curVideo.id)
      .then(
       function success(data){
         data.forEach(function(item,index) { // Analyze sub's time 
           item.__text = item.__text.replace(/&#39;/g, '\'');
           item.__text = item.__text.replace(/&quot;/g, '\"');           
           item.__text= item.__text.charAt(0).toUpperCase() + item.__text.slice(1);
           var start = parseFloat(item._start);
           item._start = parseFloat(item._start).toFixed(1);
           var dur = parseFloat(item._dur);
           item.totalTime = start+dur;
           item.timeStart = secondsToHms(start.toFixed(0));
         });
        console.log('save video' );
        console.log( $scope.curVideo);
        $scope.curVideo.sub = data;
        // Check is need seek to 
        if(YoutubeService.checkIsSeekToSub()){
          console.log('seek to: ');
          $scope.timeClick(YoutubeService.getCurSub());
        }
        else{
          console.log('play normal: '); 
          //save cur video to history      
          var curTime = now.getHours()+'h:'+now.getMinutes()+' '+now.getDate()+'/'+(now.getMonth()+1)+'/'+now.getFullYear();
          YoutubeService.saveVideo($scope.curVideo, curTime);         
          $scope.player.playVideo();
        }
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
      // Check is need seek to 
      if(YoutubeService.checkIsSeekToSub()){
        console.log('seek to: ' + YoutubeService.getCurSub().__text);
        $scope.timeClick(YoutubeService.getCurSub());
      }
      else
      $scope.player.playVideo();
      
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

   $scope.onSwipeLeft = function(){
     $scope.player.pauseVideo();
   }

   $scope.onSwipeRight = function(){
     $scope.player.playVideo();
   }

   $scope.onSwipeUp = function(){
     $scope.player.pauseVideo();
   }
   
   $scope.onSwipeDown = function(){
     $scope.player.pauseVideo();
   }
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
    SentenceService.add(item, $scope.curVideo).then(
    function(res){
      //console.log(res);
    },function(err){
        console.log(err);
    });
  }
})

.controller('SentenceCtrl', function($scope, SentenceService, $ionicPopup, YoutubeService, $state) {
  $scope.Sentences = [];
  $scope.searchStr = '';
  $scope.filterStr = '';
  
  $scope.$on('$ionicView.enter', function(ev) {
    $scope.loadAll();
  });
  $scope.loadAll = function(){
    SentenceService.getAll().then(
      function(res){
        res.forEach(function(item, index) {
          item.sentence = JSON.parse(item.sentence);
        });
        $scope.Sentences = res;
    },function(err){
        console.log(err);
    }
    );
    $scope.remove = function(item){
      var confirmPopup1 = $ionicPopup.confirm({
        title: 'Remove Item',
        template: 'Are you sure to remove "' + item.sentence + '" ?'
      });
      confirmPopup1.then(function(res) {
       if(res) {
        SentenceService.deleteItem(item.id);
        $scope.Sentences.splice($scope.Sentences.indexOf(item), 1);
       } else {
       }
     });
    };
    $scope.empty = function(){
      $scope.searchStr = '';
    };
    $scope.sentenceClick = function(){

    };
  };
  $scope.clearSentences = function(){
    var confirmPopup = $ionicPopup.confirm({
       title: 'Clear All Saved Sentences',
       template: 'Are you sure to remove all saved sentences ?'
     });
     confirmPopup.then(function(res) {
       if(res) {
        SentenceService.clearSentences();
        $scope.Sentences = [];
       } else {
       }
     });
  }
  $scope.itemClick = function(item){
    console.log(item);
    var tempVideo = {
      id : item.videoId
    }
    YoutubeService.setIsSeekToSub(true);
    YoutubeService.setCurSub(item.sentence);
    YoutubeService.setCurVideo(tempVideo);
  }
  $scope.practice = function(item){
    SentenceService.setCurPracticeSentences(item);
    $state.go('tab.practice')
  }
})

.controller('PracticeCtrl', function($scope, $ionicPlatform, $rootScope, SentenceService, YoutubeService, $state) {
  $scope.curSub = null;
  $scope.point = 0;
  $scope.isShowPoint = false;
  $scope.isRecording = false;
  var recognition = '';
  $scope.focusWords = '';
  
   $scope.$on('$ionicView.enter', function(ev) {
     $scope.curSub =SentenceService.getCurPraticeSentences();

  });

  $scope.recognizedText = "Click button recording";
    
  $scope.record = function() {
    $scope.isShowPoint = false;
    $scope.point = 0;
    $scope.focusWords = '';
      //recognition = new webkitSpeechRecognition(); //To Computer
      recognition = new SpeechRecognition(); // To Device
      recognition.lang = 'en-GB';
      recognition.onresult = function(event) {
        $scope.isRecording = false;
        $scope.recognizedText = "";
        console.log("KQ: " + event.results.length);
        if (event.results.length > 0) {
            $scope.recognizedText = event.results[0][0].transcript;
            $scope.$apply();
            $scope.estimatePoint($scope.recognizedText.toLowerCase(), $scope.curSub.sentence.__text.toLowerCase());
            
        }
      };
      recognition.onerror = function(event) {
         $scope.recognizedText = "Không nhận được giọng nói, vui lòng thử lại";
      }
      recognition.start();
      $scope.isRecording = true;
      $scope.recognizedText = "Listening...";
           
  };
  $scope.stopRecord = function(){
    recognition.stop();    
    $scope.isRecording = false;
    $scope.recognizedText = "Click button recording";
  }
  $scope.estimatePoint = function(str1, str2){
    str2 = str2.replace(/,/g, '');
    str2 = str2.replace(/-/g, '');
    str2 = str2.replace('?', '');
    str2 = str2.replace(/!/g, '');
    str2 = str2.replace(/you're/g, 'you are');
    
    console.log(str2);
    var strArr = str2.split(' ');
    var point = 0;
    var res = str1.split(' ');
    res.forEach(function(item, index){
      if (str2.indexOf(item)>=0){
        point++; 
        var index = strArr.indexOf(item);
        strArr.splice(index, 1);
      }
    });

    $scope.point = ((point/res.length)*100).toFixed(0);
    $scope.focusWords = strArr.toString();
    $scope.isShowPoint = true;
    if ($scope.curSub.point < $scope.point)
      SentenceService.updatePoint($scope.curSub, $scope.point);
  }
  $scope.watch = function(){
    var tempVideo = {
      id : $scope.curSub.videoId
    }
    YoutubeService.setIsSeekToSub(true);
    YoutubeService.setCurSub($scope.curSub.sentence);
    YoutubeService.setCurVideo(tempVideo);
    $state.go('tab.videoplayer');
  }
});