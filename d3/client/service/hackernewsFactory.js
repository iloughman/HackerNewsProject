app.factory('hackernewsFactory', function($q){
	var factory = {};
	var ref = new Firebase("https://hacker-news.firebaseio.com/v0/");
	var itemRef;
	var numStories = 30;
	var deferred = $q.defer();
	var deferred2 = $q.defer();

	factory.setHNtopStoriesAPIListener = function(){

		ref.child('topstories').on('value', function(snapshot){
			var idArray = snapshot.val().slice(0,numStories);
			var itemArray = []
			idArray.forEach(function(id){
				ref.child('item/'+id).once('value', function(snap){
					itemArray.push(snap.val())
					if (itemArray.length >= idArray.length){
						deferred.resolve(itemArray);
					}
				});
			});
		})

		return deferred.promise;
	}

	factory.setHNnewStoriesAPIListener = function(){

		ref.child('newstories').on('value', function(snapshot){
			var idArray = snapshot.val().slice(0,numStories);
			var itemArray = []
			idArray.forEach(function(id){
				ref.child('item/'+id).once('value', function(snap){
					itemArray.push(snap.val())
					if (itemArray.length >= idArray.length){
						deferred2.resolve(itemArray);
					}
				});
			});
		})

		return deferred2.promise;
	}

	return factory;
});