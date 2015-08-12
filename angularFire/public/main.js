var app = angular.module('hackernews', ['ui.router', 'firebase']);

app.config(function ($urlRouterProvider, $locationProvider) {
   // This turns off hashbang urls (/#about) and changes it to something normal (/about)
   $locationProvider.html5Mode(true);
   // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
   $urlRouterProvider.otherwise('/');
});

app.run(function($rootScope) {
  $rootScope.$on("$stateChangeError", console.log.bind(console));
});

app.directive("navbar", function(){
	return {
		restrict: "E",
		templateUrl: "/navbar/navbar.html"
	};
});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm5hdmJhci9uYXZiYXIuZGlyZWN0aXZlLmpzIiwidG9wTmV3cy90b3BOZXdzLmNvbnRyb2xsZXIuanMiLCJ0b3BOZXdzL3RvcE5ld3Muc3RhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2hhY2tlcm5ld3MnLCBbJ3VpLnJvdXRlcicsICdmaXJlYmFzZSddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcblxuYXBwLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlKSB7XG4gICRyb290U2NvcGUuJG9uKFwiJHN0YXRlQ2hhbmdlRXJyb3JcIiwgY29uc29sZS5sb2cuYmluZChjb25zb2xlKSk7XG59KTtcbiIsImFwcC5kaXJlY3RpdmUoXCJuYXZiYXJcIiwgZnVuY3Rpb24oKXtcblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogXCJFXCIsXG5cdFx0dGVtcGxhdGVVcmw6IFwiL25hdmJhci9uYXZiYXIuaHRtbFwiXG5cdH07XG59KTsiLCJhcHAuY29udHJvbGxlcigndG9wTmV3c0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIGJyb2FkY2FzdEZhY3RvcnksICRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKFwiaHR0cHM6Ly9oYWNrZXItbmV3cy5maXJlYmFzZWlvLmNvbS92MC90b3BzdG9yaWVzL1wiKTtcbiAgICB2YXIgbnVtU3RvcmllcyA9IDMwO1xuICAgIC8vIHZhciBzeW5jT2JqZWN0ID0gJGZpcmViYXNlQXJyYXkocmVmKTtcblxuICAgIHJlZi5vbmNlKCd2YWx1ZScsIGZ1bmN0aW9uKHNuYXBzaG90KXtcbiAgICAgICAgdmFyIGlkQXJyYXkgPSBzbmFwc2hvdC52YWwoKS5zbGljZSgwLG51bVN0b3JpZXMpO1xuICAgICAgICB2YXIgaXRlbUFycmF5ID0gW107XG4gICAgICAgIGlkQXJyYXkuZm9yRWFjaChmdW5jdGlvbihpZCl7XG4gICAgICAgICAgICB2YXIgc3RvcnlSZWYgPSBuZXcgRmlyZWJhc2UoXCJodHRwczovL2hhY2tlci1uZXdzLmZpcmViYXNlaW8uY29tL3YwL3RvcHN0b3JpZXMvXCIraWQpXG4gICAgICAgICAgICBpdGVtQXJyYXkucHVzaCgkZmlyZWJhc2VPYmplY3Qoc3RvcnlSZWYpKVxuICAgICAgICAgICAgaWYgKGl0ZW1BcnJheS5sZW5ndGggPj0gaWRBcnJheS5sZW5ndGgpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGl0ZW1BcnJheSk7XG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlKGl0ZW1BcnJheSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gc3luY09iamVjdC4kbG9hZGVkKClcbiAgICAvLyAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coZGF0YSA9PT0gc3luY09iamVjdCk7IC8vIHRydWVcbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKHN5bmNPYmplY3QpXG4gICAgLy8gICAgIH0pXG4gICAgLy8gICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuICAgIC8vICAgICAgICAgY29uc29sZS5lcnJvcihcIkVyOlwiLCBlcnJvcik7XG4gICAgLy8gICAgIH0pO1xuXG4gICAgLy8gJHNjb3BlLmJyb2FkY2FzdEZyb21GaXJlYmFzZSA9IGJyb2FkY2FzdEZhY3RvcnkuZ2V0QnJvYWRjYXN0KCk7XG5cbiAgICBmdW5jdGlvbiBnZXRNaW51dGVzKHRpbWUpe1xuICAgICAgICB2YXIgcmVzdWx0ID0gTWF0aC5mbG9vcigoRGF0ZS5ub3coKS0odGltZSoxMDAwKSkvNjAwMDApO1xuICAgICAgICByZXR1cm4gcmVzdWx0IDwgNjAgPyByZXN1bHQrJyBtaW51dGVzIGFnbycgOiBNYXRoLmZsb29yKHJlc3VsdC82MCkrXG4gICAgICAgICAgKE1hdGguZmxvb3IocmVzdWx0LzYwKSA9PT0gMSA/ICcgaG91ciBhZ28nIDogJyBob3VycyBhZ28nKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZm9ybWF0Q29tbWVudHMobnVtQ29tbWVudHMpe1xuICAgICAgICByZXR1cm4gIW51bUNvbW1lbnRzID8gJ25vIGNvbW1lbnRzJyA6IChcbiAgICAgICAgICAgIG51bUNvbW1lbnRzID09PSAxID8gbnVtQ29tbWVudHMrJyBjb21tZW50JyA6IG51bUNvbW1lbnRzKycgY29tbWVudHMnXG4gICAgICAgICAgICApO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBmb3JtYXRVcmwodXJsKXtcbiAgICAgICAgaWYgKHVybCA9PT0gXCJcIiB8fCB1cmwgPT09IHVuZGVmaW5lZCl7cmV0dXJuIFwiXCJ9XG4gICAgICAgIHZhciByZXN1bHQgPSB1cmwucmVwbGFjZSgvLio/OlxcL1xcLy9nLCBcIlwiKTtcbiAgICAgICAgaWYgKHJlc3VsdC5pbmRleE9mKCd3d3cuJykgPT09IDApIHtyZXN1bHQgPSByZXN1bHQuc2xpY2UoNCxyZXN1bHQubGVuZ3RoKX1cbiAgICAgICAgICAgIHJldHVybiAnKCcrcmVzdWx0LnNsaWNlKDAscmVzdWx0LmluZGV4T2YoJy8nKSkrJyknO1xuICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3RvcE5ld3MnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy90b3BOZXdzL3RvcE5ld3Muc3RhdGUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICd0b3BOZXdzQ3RybCdcbiAgICB9KTtcbn0pO1xuXG5hcHAuZmFjdG9yeSgnYnJvYWRjYXN0RmFjdG9yeScsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5KXtcblx0dmFyIGZhY3RvcnkgPSB7fTtcblxuXHRmYWN0b3J5LmdldEJyb2FkY2FzdCA9IGZ1bmN0aW9uKGtleSkge1xuXHRcdHJldHVybiAkZmlyZWJhc2VBcnJheShuZXcgRmlyZWJhc2UoXCJodHRwczovL2hhY2tlci1uZXdzLmZpcmViYXNlaW8uY29tL3YwL1wiKSlcblx0fVxuXG5cdHJldHVybiBmYWN0b3J5O1xufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9