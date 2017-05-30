angular.module('app.services', [])

.factory('SentenceService', function($cordovaSQLite, $q) {
  var curPracticeSentence = null;

 return {
    getCurPraticeSentences : function(){
        return this.curPracticeSentence;
    },
    setCurPracticeSentences : function(value){
       this.curPracticeSentence = value;
    },
    add: function(newSentence, video) {
      var d = $q.defer();
       $cordovaSQLite.execute(db, 'DELETE FROM Sentences WHERE sentence == ?', [JSON.stringify(newSentence)])
       $cordovaSQLite.execute(db, 'INSERT INTO Sentences (sentence, videoId, videoTitle, point) VALUES (?,?,?,?)', [JSON.stringify(newSentence), video.id, video.title, 0])
        .then(function(result) {
          d.resolve('success');
        }, function(error) {
          d.reject(error);
        });
      return d.promise;
    },
    updatePoint: function(sentence, point) {
      console.log(sentence.id + '- ' + point);
      var d = $q.defer();
       $cordovaSQLite.execute(db, 'UPDATE Sentences SET point = ? WHERE id == ?', [point,sentence.id])
        .then(function(result) {
          console.log(result);
          d.resolve('success');
        }, function(error) {
          console.log(error );
          d.reject("error");
        });
      return d.promise;
    },
    getAll: function() {
      var d = $q.defer();
       $cordovaSQLite.execute(db, 'SELECT * FROM Sentences ORDER BY id DESC')
      .then(function(res) {
            var lst = [];
            for(var i=0; i<res.rows.length; i++){
                lst.push(res.rows.item(i));
            } 
            d.resolve(lst);
        },function(error) {
            d.reject("error");
        }
      );
      return d.promise;
    },
    deleteItem: function(itemId) {
      var d = $q.defer();
       $cordovaSQLite.execute(db, 'DELETE FROM Sentences WHERE id == ?', [itemId])
      .then(function(result) {
          d.resolve('success');
        }, function(error) {
          d.reject("error");
        });
      return d.promise;
    },
    clearSentences: function(){
       var d = $q.defer();
        $cordovaSQLite.execute(db, 'DELETE FROM Sentences')
        .then(function(result) {
          d.resolve('success');
        }, function(error) {
          d.reject("error");
        });
      return d.promise;
     
    }
  };
})
.factory('YoutubeService', function($http, $q, $cordovaSQLite){
  var videos = [
      {
          id: '8jPQjjsBbIc',
          title:'How to stay calm when you know you\'ll be stressed | Daniel Levitin',
          views: '3.951.103',
          thumbnail: 'https://i.ytimg.com/vi/8jPQjjsBbIc/hqdefault.jpg?custom=true&w=246&h=138&stc=true&jpg444=true&jpgq=90&sp=68&sigh=K00xt6SL_hLi-cru23fG16Of67M',
          time: '12:20'
      },
      {
          id: 'vcPJkz-D5II',
          title:'The evolution of animal genitalia - Menno Schilthuizen',
          views: '365.224',
          thumbnail: 'https://i.ytimg.com/vi/vcPJkz-D5II/hqdefault.jpg?custom=true&w=246&h=138&stc=true&jpg444=true&jpgq=90&sp=68&sigh=-c3hxYg8tmSci2oPuH3tLD6jMT8',
          time: '05:36'
      },
      {
          id: 'sz3Yv3On4lE',
          title:'The three different ways mammals give birth - Kate Slabosky',
          views: '660.578',
          thumbnail: 'https://i.ytimg.com/vi/sz3Yv3On4lE/hqdefault.jpg?custom=true&w=246&h=138&stc=true&jpg444=true&jpgq=90&sp=68&sigh=8vyaBTrgKNNj9gDH4IDo-tAKyJ8',
          time: '04:50'
      },
      {
          id: 'ibjUpk9Iagk',
          title:'The history of chocolate - Deanna Pucciarelli',
          views: '678.213',
          thumbnail: 'https://i.ytimg.com/vi/ibjUpk9Iagk/hqdefault.jpg?custom=true&w=246&h=138&stc=true&jpg444=true&jpgq=90&sp=68&sigh=A-B6ZurydnPl8R1vUsucFVoYftA',
          time: '04:41'
      },
      {
          id: 'jf_4z4AKwJg',
          title:'Where does gold come from? - David Lunney',
          views: '1.380.660',
          thumbnail: 'https://i.ytimg.com/vi/jf_4z4AKwJg/hqdefault.jpg?custom=true&w=246&h=138&stc=true&jpg444=true&jpgq=90&sp=68&sigh=qINu4_OeU7dY6ohKPjnjIQDpn_U',
          time: '04:35'
      },
      {
          id: 'XNu5ppFZbHo',
          title:'What gives a dollar bill its value? - Doug Levinson',
          views: '1.460.577',
          thumbnail: 'https://i.ytimg.com/vi/XNu5ppFZbHo/hqdefault.jpg?custom=true&w=246&h=138&stc=true&jpg444=true&jpgq=90&sp=68&sigh=NTiD7gzGBq3ximjRsj3Gh00GIbc',
          time: '03:52'
      },
      {
          id: 'jILgxeNBK_8',
          title:'Why do competitors open their stores next to one another? - Jac de Haan',
          views: '2.303.340',
          thumbnail: 'https://i.ytimg.com/vi/jILgxeNBK_8/hqdefault.jpg?custom=true&w=246&h=138&stc=true&jpg444=true&jpgq=90&sp=68&sigh=Dm_oLZCwOoaKxqzfkq2M4pLVAEw',
          time: '04:07'
      }
  ];
  var curVideo = {};
  var isSeekToSub = false;
  var curSub = {};
  var baseUrl = "http://video.google.com/timedtext?lang=en&v=";
  return{
    getCurSub: function(){
      return this.curSub;
    },
    setCurSub: function(value){
      this.curSub = value;
    },
    checkIsSeekToSub: function(){
      return this.isSeekToSub;
    },
    setIsSeekToSub: function(value){
      this.isSeekToSub = value;
    },
     getCurVideo: function(){
      return this.curVideo;
    },
    setCurVideo: function(video){
      this.curVideo = video;
    },
    getSub: function(videoId) {
      var d = $q.defer();
      var SubItems = {};
      var x2js = new X2JS();
      $http.get(baseUrl+videoId)
      .success(function(data){
          var dom  = x2js.xml_str2json(data);
          SubItems = dom.transcript.text;
          d.resolve(SubItems);
      })
      .error(function(err){
           d.reject("error");
      });
      return d.promise;
    },
    getAllVideo: function(){
      return videos;
    },
    saveVideo: function(video, time) {
      
      var d = $q.defer();
       $cordovaSQLite.execute(db, 'DELETE FROM Videos WHERE id == ?', [video.id]);
       $cordovaSQLite.execute(db, 'INSERT INTO Videos (id, title, sub, dt, thumbnail) VALUES (?,?,?,?,?)', [video.id, video.title, JSON.stringify(video.sub), time, video.thumbnail])
        .then(function(result) {
          d.resolve('success');
        }, function(error) {
          console.log('err:' +  error.message);
          d.reject("error");
        });
      return d.promise;
    },
    deleteRecentVideo: function(itemId) {
      var d = $q.defer();
       $cordovaSQLite.execute(db, 'DELETE FROM Videos WHERE id == ?', [itemId])
      .then(function(result) {
          d.resolve('success');
        }, function(error) {
          d.reject("error");
        });
      return d.promise;
    },
    clearRecent: function(){
       var d = $q.defer();
        $cordovaSQLite.execute(db, 'DELETE FROM Videos')
        .then(function(result) {
          d.resolve('success');
        }, function(error) {
          d.reject("error");
        });
      return d.promise;
     
    },
     getAllRecent: function() {
      var d = $q.defer();
       $cordovaSQLite.execute(db, 'SELECT * FROM Videos ORDER BY rowid DESC')
      .then(function(res) {
            var lst = [];
            for(var i=0; i<res.rows.length; i++){
                lst.push(res.rows.item(i));
            } 
            d.resolve(lst);
        },function(error) {
            d.reject("error");
        }
      );
      return d.promise;
    },
  }
});