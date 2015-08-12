app.config(function ($stateProvider) {
    $stateProvider.state('topNews', {
        url: '/',
        templateUrl: '/topNews/topNews.state.html',
        controller: 'topNewsCtrl'
    });
});

app.factory('broadcastFactory', function($firebaseArray){
	var factory = {};

	factory.getBroadcast = function(key) {
		return $firebaseArray(new Firebase("https://hacker-news.firebaseio.com/v0/"))
	}

	return factory;
});