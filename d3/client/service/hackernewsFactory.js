app.factory('hackernewsFactory', function($q){
	var factory = {};

	factory.getHNStories = function(idArray,url){

		var ref = new Firebase(url);
		var deferred = $q.defer();
		var itemArray = []

		idArray.forEach(function(id){
			ref.child('item/'+id).once('value', function(snap){
				itemArray.push(snap.val())
				if (itemArray.length >= idArray.length){
					// console.log("item", itemArray)
					deferred.resolve(itemArray);
				}
			});
		});

		return deferred.promise;
	}

	factory.getNewHNStories = function(idArray,url){

		var ref = new Firebase(url);
		var deferred = $q.defer();
		var itemArray = []

		idArray.forEach(function(id){
			ref.child('item/'+id).once('value', function(snap){
				itemArray.push(snap.val())
				if (itemArray.length >= idArray.length){
					// console.log("item", itemArray)
					deferred.resolve(itemArray);
				}
			});
		});
		
		return deferred.promise;
	}

	return factory;
});