app.controller('topNewsCtrl', function($scope, broadcastFactory, $firebaseObject, $firebaseArray) {
    var ref = new Firebase("https://hacker-news.firebaseio.com/v0/topstories/");
    var numStories = 30;
    // var syncObject = $firebaseArray(ref);

    ref.once('value', function(snapshot){
        var idArray = snapshot.val().slice(0,numStories);
        var itemArray = [];
        idArray.forEach(function(id){
            var storyRef = new Firebase("https://hacker-news.firebaseio.com/v0/topstories/"+id)
            itemArray.push($firebaseObject(storyRef))
            if (itemArray.length >= idArray.length){
                console.log(itemArray);
                // update(itemArray);
            }
        });
    });

    // syncObject.$loaded()
    //     .then(function(data) {
    //         console.log(data === syncObject); // true
    //         console.log(syncObject)
    //     })
    //     .catch(function(error) {
    //         console.error("Er:", error);
    //     });

    // $scope.broadcastFromFirebase = broadcastFactory.getBroadcast();

    function getMinutes(time){
        var result = Math.floor((Date.now()-(time*1000))/60000);
        return result < 60 ? result+' minutes ago' : Math.floor(result/60)+
          (Math.floor(result/60) === 1 ? ' hour ago' : ' hours ago');
    };

    function formatComments(numComments){
        return !numComments ? 'no comments' : (
            numComments === 1 ? numComments+' comment' : numComments+' comments'
            );
    };

    function formatUrl(url){
        if (url === "" || url === undefined){return ""}
        var result = url.replace(/.*?:\/\//g, "");
        if (result.indexOf('www.') === 0) {result = result.slice(4,result.length)}
            return '('+result.slice(0,result.indexOf('/'))+')';
    };

});