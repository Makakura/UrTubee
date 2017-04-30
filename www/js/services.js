angular.module('app.services', [])

.factory('SentenceService', function($cordovaSQLite, $q) {
 return {
    add: function(newSentence, video) {
      var d = $q.defer();
       $cordovaSQLite.execute(db, 'INSERT INTO Sentences (sentence, videoId, videoTitle) VALUES (?,?,?)', [newSentence, video.id, video.title])
        .then(function(result) {
          d.resolve('success');
        }, function(error) {
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
    }
  };
})
.factory('SubService', function($http, $q) {
  var baseUrl = "http://video.google.com/timedtext?lang=en&v=";
  return {
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
    }
  };
});
