var app = angular.module('hackernews', ['ui.router']);

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
app.controller('newestCtrl', function($scope, hackernewsFactory, formatFactory) {
   
    var url = "https://hacker-news.firebaseio.com/v0/";
    var ref = new Firebase(url);
    var numStories = 30;
    var getMinutes = formatFactory.getMinutes;
    var formatComments = formatFactory.formatComments;
    var formatUrl = formatFactory.formatUrl;
    var formatPoints = formatFactory.formatPoints;

  
    var update = function(data){
        var divs = d3.select('div.newStories').selectAll('div')
            .data(data, function(d){
                if (d) {return d.id}})

        divs.enter().append('div');

        divs.exit().remove();
        divs.order();
        var count = 0;
        divs.html(function(d,index){
            count++;
            return '<div class="lineOne"><span class="index">'+
                count+'. &#x25b2;</span> <a href='+d.url+' class="articleTitle">'+d.title+'</a>'+
                '<span class="articleUrl">'+formatUrl(d.url)+'</span></div>'})

        divs.append('div')
            .attr('class', 'lineTwo')
            .html(function(d){
                return '<span>'+formatPoints(d.score)+
                    ' points by <a href=https://news.ycombinator.com/user?id='+
                    d.by+'>'+d.by+'</a>'+
                    '<a href=https://news.ycombinator.com/item?id='+d.id+'>'+getMinutes(d.time)+'</a> | '+
                    '<a href=https://news.ycombinator.com/item?id='+d.id+'>'+formatComments(d.descendants)+'</span>'})
    }

    ref.child('newstories').on('value', function(snapshot){
        var idArray = snapshot.val().slice(0,numStories);
        hackernewsFactory.getNewHNStories(idArray,url).then(function(newStories){
            update(newStories)
        });
    });

});
app.config(function ($stateProvider) {
    $stateProvider.state('newest', {
        url: '/newest',
        templateUrl: '/newest/newest.html',
        controller: 'newestCtrl'
    });
});
app.factory('formatFactory', function(){
	var factory = {};
	factory.getMinutes = function(time){
	    var result = Math.floor((Date.now()-(time*1000))/60000);
	    return result < 60 ? result+' minutes ago' : Math.floor(result/60)+
	      (Math.floor(result/60) === 1 ? ' hour ago' : ' hours ago');
	};

	factory.formatComments = function(numComments){
	    return !numComments ? 'no comments' : (
	        numComments === 1 ? numComments+' comment' : numComments+' comments'
	        );
	};

	factory.formatUrl = function(url){
	    if (url === "" || url === undefined){return ""}
	    var result = url.replace(/.*?:\/\//g, "");
	    if (result.indexOf('www.') === 0) {result = result.slice(4,result.length)}
	        return '('+result.slice(0,result.indexOf('/'))+')';
	};

	factory.formatPoints = function(points){
		return points > 1 ? points+' points': (
			points === 1 ? points+' point' : ''
		);
	};

	return factory;
});
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
app.controller('topNewsCtrl', function($scope, hackernewsFactory, formatFactory) {
    
    var url = "https://hacker-news.firebaseio.com/v0/";
    var ref = new Firebase(url);
    var numStories = 30;
    var getMinutes = formatFactory.getMinutes;
    var formatComments = formatFactory.formatComments;
    var formatUrl = formatFactory.formatUrl;
    var formatPoints = formatFactory.formatPoints;

    var update = function(data){
        var divs = d3.select('div.topNews').selectAll('div')
  		    .data(data, function(d){
                if (d) {return d.id}})

      	divs.enter().append('div');

      	divs.exit().remove();

        divs.order();
        var count = 0;
      	divs.html(function(d,index){
            count++;
      		return '<div class="lineOne"><span class="index">'+
            count+'. &#x25b2;</span> <a href='+d.url+' class="articleTitle">'+d.title+'</a>'+
            '<span class="articleUrl">'+formatUrl(d.url)+'</span></div>'})

      	divs.append('div')
      		.attr('class', 'lineTwo')
      		.html(function(d){
      			return '<span>'+formatPoints(d.score)+' points by <a href=https://news.ycombinator.com/user?id='+
                d.by+'>'+d.by+'</a>'+
                '<a href=https://news.ycombinator.com/item?id='+d.id+'>'+getMinutes(d.time)+'</a> | '+
                '<a href=https://news.ycombinator.com/item?id='+d.id+'>'+formatComments(d.descendants)+'</span>'})
    }

    ref.child('topstories').on('value', function(snapshot){
        var idArray = snapshot.val().slice(0,numStories);
        hackernewsFactory.getHNStories(idArray,url).then(function(topStories){
            console.log(topStories);
            update(topStories)
        });
    });

});
app.config(function ($stateProvider) {
    $stateProvider.state('topNews', {
        url: '/',
        templateUrl: '/topNews/topNews.html',
        controller: 'topNewsCtrl'
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm5hdmJhci9uYXZiYXIuZGlyZWN0aXZlLmpzIiwibmV3ZXN0L25ld2VzdC5jb250cm9sbGVyLmpzIiwibmV3ZXN0L25ld2VzdC5zdGF0ZS5qcyIsInNlcnZpY2UvZm9ybWF0RmFjdG9yeS5qcyIsInNlcnZpY2UvaGFja2VybmV3c0ZhY3RvcnkuanMiLCJ0b3BOZXdzL3RvcE5ld3MuY29udHJvbGxlci5qcyIsInRvcE5ld3MvdG9wTmV3cy5zdGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2hhY2tlcm5ld3MnLCBbJ3VpLnJvdXRlciddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcblxuYXBwLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlKSB7XG4gICRyb290U2NvcGUuJG9uKFwiJHN0YXRlQ2hhbmdlRXJyb3JcIiwgY29uc29sZS5sb2cuYmluZChjb25zb2xlKSk7XG59KTtcbiIsImFwcC5kaXJlY3RpdmUoXCJuYXZiYXJcIiwgZnVuY3Rpb24oKXtcblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogXCJFXCIsXG5cdFx0dGVtcGxhdGVVcmw6IFwiL25hdmJhci9uYXZiYXIuaHRtbFwiXG5cdH07XG59KTsiLCJhcHAuY29udHJvbGxlcignbmV3ZXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgaGFja2VybmV3c0ZhY3RvcnksIGZvcm1hdEZhY3RvcnkpIHtcbiAgIFxuICAgIHZhciB1cmwgPSBcImh0dHBzOi8vaGFja2VyLW5ld3MuZmlyZWJhc2Vpby5jb20vdjAvXCI7XG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZSh1cmwpO1xuICAgIHZhciBudW1TdG9yaWVzID0gMzA7XG4gICAgdmFyIGdldE1pbnV0ZXMgPSBmb3JtYXRGYWN0b3J5LmdldE1pbnV0ZXM7XG4gICAgdmFyIGZvcm1hdENvbW1lbnRzID0gZm9ybWF0RmFjdG9yeS5mb3JtYXRDb21tZW50cztcbiAgICB2YXIgZm9ybWF0VXJsID0gZm9ybWF0RmFjdG9yeS5mb3JtYXRVcmw7XG4gICAgdmFyIGZvcm1hdFBvaW50cyA9IGZvcm1hdEZhY3RvcnkuZm9ybWF0UG9pbnRzO1xuXG4gIFxuICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdmFyIGRpdnMgPSBkMy5zZWxlY3QoJ2Rpdi5uZXdTdG9yaWVzJykuc2VsZWN0QWxsKCdkaXYnKVxuICAgICAgICAgICAgLmRhdGEoZGF0YSwgZnVuY3Rpb24oZCl7XG4gICAgICAgICAgICAgICAgaWYgKGQpIHtyZXR1cm4gZC5pZH19KVxuXG4gICAgICAgIGRpdnMuZW50ZXIoKS5hcHBlbmQoJ2RpdicpO1xuXG4gICAgICAgIGRpdnMuZXhpdCgpLnJlbW92ZSgpO1xuICAgICAgICBkaXZzLm9yZGVyKCk7XG4gICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgIGRpdnMuaHRtbChmdW5jdGlvbihkLGluZGV4KXtcbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJsaW5lT25lXCI+PHNwYW4gY2xhc3M9XCJpbmRleFwiPicrXG4gICAgICAgICAgICAgICAgY291bnQrJy4gJiN4MjViMjs8L3NwYW4+IDxhIGhyZWY9JytkLnVybCsnIGNsYXNzPVwiYXJ0aWNsZVRpdGxlXCI+JytkLnRpdGxlKyc8L2E+JytcbiAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJhcnRpY2xlVXJsXCI+Jytmb3JtYXRVcmwoZC51cmwpKyc8L3NwYW4+PC9kaXY+J30pXG5cbiAgICAgICAgZGl2cy5hcHBlbmQoJ2RpdicpXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnbGluZVR3bycpXG4gICAgICAgICAgICAuaHRtbChmdW5jdGlvbihkKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gJzxzcGFuPicrZm9ybWF0UG9pbnRzKGQuc2NvcmUpK1xuICAgICAgICAgICAgICAgICAgICAnIHBvaW50cyBieSA8YSBocmVmPWh0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vdXNlcj9pZD0nK1xuICAgICAgICAgICAgICAgICAgICBkLmJ5Kyc+JytkLmJ5Kyc8L2E+JytcbiAgICAgICAgICAgICAgICAgICAgJzxhIGhyZWY9aHR0cHM6Ly9uZXdzLnljb21iaW5hdG9yLmNvbS9pdGVtP2lkPScrZC5pZCsnPicrZ2V0TWludXRlcyhkLnRpbWUpKyc8L2E+IHwgJytcbiAgICAgICAgICAgICAgICAgICAgJzxhIGhyZWY9aHR0cHM6Ly9uZXdzLnljb21iaW5hdG9yLmNvbS9pdGVtP2lkPScrZC5pZCsnPicrZm9ybWF0Q29tbWVudHMoZC5kZXNjZW5kYW50cykrJzwvc3Bhbj4nfSlcbiAgICB9XG5cbiAgICByZWYuY2hpbGQoJ25ld3N0b3JpZXMnKS5vbigndmFsdWUnLCBmdW5jdGlvbihzbmFwc2hvdCl7XG4gICAgICAgIHZhciBpZEFycmF5ID0gc25hcHNob3QudmFsKCkuc2xpY2UoMCxudW1TdG9yaWVzKTtcbiAgICAgICAgaGFja2VybmV3c0ZhY3RvcnkuZ2V0TmV3SE5TdG9yaWVzKGlkQXJyYXksdXJsKS50aGVuKGZ1bmN0aW9uKG5ld1N0b3JpZXMpe1xuICAgICAgICAgICAgdXBkYXRlKG5ld1N0b3JpZXMpXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCduZXdlc3QnLCB7XG4gICAgICAgIHVybDogJy9uZXdlc3QnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9uZXdlc3QvbmV3ZXN0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnbmV3ZXN0Q3RybCdcbiAgICB9KTtcbn0pOyIsImFwcC5mYWN0b3J5KCdmb3JtYXRGYWN0b3J5JywgZnVuY3Rpb24oKXtcblx0dmFyIGZhY3RvcnkgPSB7fTtcblx0ZmFjdG9yeS5nZXRNaW51dGVzID0gZnVuY3Rpb24odGltZSl7XG5cdCAgICB2YXIgcmVzdWx0ID0gTWF0aC5mbG9vcigoRGF0ZS5ub3coKS0odGltZSoxMDAwKSkvNjAwMDApO1xuXHQgICAgcmV0dXJuIHJlc3VsdCA8IDYwID8gcmVzdWx0KycgbWludXRlcyBhZ28nIDogTWF0aC5mbG9vcihyZXN1bHQvNjApK1xuXHQgICAgICAoTWF0aC5mbG9vcihyZXN1bHQvNjApID09PSAxID8gJyBob3VyIGFnbycgOiAnIGhvdXJzIGFnbycpO1xuXHR9O1xuXG5cdGZhY3RvcnkuZm9ybWF0Q29tbWVudHMgPSBmdW5jdGlvbihudW1Db21tZW50cyl7XG5cdCAgICByZXR1cm4gIW51bUNvbW1lbnRzID8gJ25vIGNvbW1lbnRzJyA6IChcblx0ICAgICAgICBudW1Db21tZW50cyA9PT0gMSA/IG51bUNvbW1lbnRzKycgY29tbWVudCcgOiBudW1Db21tZW50cysnIGNvbW1lbnRzJ1xuXHQgICAgICAgICk7XG5cdH07XG5cblx0ZmFjdG9yeS5mb3JtYXRVcmwgPSBmdW5jdGlvbih1cmwpe1xuXHQgICAgaWYgKHVybCA9PT0gXCJcIiB8fCB1cmwgPT09IHVuZGVmaW5lZCl7cmV0dXJuIFwiXCJ9XG5cdCAgICB2YXIgcmVzdWx0ID0gdXJsLnJlcGxhY2UoLy4qPzpcXC9cXC8vZywgXCJcIik7XG5cdCAgICBpZiAocmVzdWx0LmluZGV4T2YoJ3d3dy4nKSA9PT0gMCkge3Jlc3VsdCA9IHJlc3VsdC5zbGljZSg0LHJlc3VsdC5sZW5ndGgpfVxuXHQgICAgICAgIHJldHVybiAnKCcrcmVzdWx0LnNsaWNlKDAscmVzdWx0LmluZGV4T2YoJy8nKSkrJyknO1xuXHR9O1xuXG5cdGZhY3RvcnkuZm9ybWF0UG9pbnRzID0gZnVuY3Rpb24ocG9pbnRzKXtcblx0XHRyZXR1cm4gcG9pbnRzID4gMSA/IHBvaW50cysnIHBvaW50cyc6IChcblx0XHRcdHBvaW50cyA9PT0gMSA/IHBvaW50cysnIHBvaW50JyA6ICcnXG5cdFx0KTtcblx0fTtcblxuXHRyZXR1cm4gZmFjdG9yeTtcbn0pOyIsImFwcC5mYWN0b3J5KCdoYWNrZXJuZXdzRmFjdG9yeScsIGZ1bmN0aW9uKCRxKXtcblx0dmFyIGZhY3RvcnkgPSB7fTtcblxuXHRmYWN0b3J5LmdldEhOU3RvcmllcyA9IGZ1bmN0aW9uKGlkQXJyYXksdXJsKXtcblxuXHRcdHZhciByZWYgPSBuZXcgRmlyZWJhc2UodXJsKTtcblx0XHR2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXHRcdHZhciBpdGVtQXJyYXkgPSBbXVxuXG5cdFx0aWRBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcblx0XHRcdHJlZi5jaGlsZCgnaXRlbS8nK2lkKS5vbmNlKCd2YWx1ZScsIGZ1bmN0aW9uKHNuYXApe1xuXHRcdFx0XHRpdGVtQXJyYXkucHVzaChzbmFwLnZhbCgpKVxuXHRcdFx0XHRpZiAoaXRlbUFycmF5Lmxlbmd0aCA+PSBpZEFycmF5Lmxlbmd0aCl7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coXCJpdGVtXCIsIGl0ZW1BcnJheSlcblx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKGl0ZW1BcnJheSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG5cdH1cblxuXHRmYWN0b3J5LmdldE5ld0hOU3RvcmllcyA9IGZ1bmN0aW9uKGlkQXJyYXksdXJsKXtcblxuXHRcdHZhciByZWYgPSBuZXcgRmlyZWJhc2UodXJsKTtcblx0XHR2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXHRcdHZhciBpdGVtQXJyYXkgPSBbXVxuXG5cdFx0aWRBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcblx0XHRcdHJlZi5jaGlsZCgnaXRlbS8nK2lkKS5vbmNlKCd2YWx1ZScsIGZ1bmN0aW9uKHNuYXApe1xuXHRcdFx0XHRpdGVtQXJyYXkucHVzaChzbmFwLnZhbCgpKVxuXHRcdFx0XHRpZiAoaXRlbUFycmF5Lmxlbmd0aCA+PSBpZEFycmF5Lmxlbmd0aCl7XG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coXCJpdGVtXCIsIGl0ZW1BcnJheSlcblx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKGl0ZW1BcnJheSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdFxuXHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXHR9XG5cblx0cmV0dXJuIGZhY3Rvcnk7XG59KTsiLCJhcHAuY29udHJvbGxlcigndG9wTmV3c0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIGhhY2tlcm5ld3NGYWN0b3J5LCBmb3JtYXRGYWN0b3J5KSB7XG4gICAgXG4gICAgdmFyIHVybCA9IFwiaHR0cHM6Ly9oYWNrZXItbmV3cy5maXJlYmFzZWlvLmNvbS92MC9cIjtcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKHVybCk7XG4gICAgdmFyIG51bVN0b3JpZXMgPSAzMDtcbiAgICB2YXIgZ2V0TWludXRlcyA9IGZvcm1hdEZhY3RvcnkuZ2V0TWludXRlcztcbiAgICB2YXIgZm9ybWF0Q29tbWVudHMgPSBmb3JtYXRGYWN0b3J5LmZvcm1hdENvbW1lbnRzO1xuICAgIHZhciBmb3JtYXRVcmwgPSBmb3JtYXRGYWN0b3J5LmZvcm1hdFVybDtcbiAgICB2YXIgZm9ybWF0UG9pbnRzID0gZm9ybWF0RmFjdG9yeS5mb3JtYXRQb2ludHM7XG5cbiAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIHZhciBkaXZzID0gZDMuc2VsZWN0KCdkaXYudG9wTmV3cycpLnNlbGVjdEFsbCgnZGl2JylcbiAgXHRcdCAgICAuZGF0YShkYXRhLCBmdW5jdGlvbihkKXtcbiAgICAgICAgICAgICAgICBpZiAoZCkge3JldHVybiBkLmlkfX0pXG5cbiAgICAgIFx0ZGl2cy5lbnRlcigpLmFwcGVuZCgnZGl2Jyk7XG5cbiAgICAgIFx0ZGl2cy5leGl0KCkucmVtb3ZlKCk7XG5cbiAgICAgICAgZGl2cy5vcmRlcigpO1xuICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgXHRkaXZzLmh0bWwoZnVuY3Rpb24oZCxpbmRleCl7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgXHRcdHJldHVybiAnPGRpdiBjbGFzcz1cImxpbmVPbmVcIj48c3BhbiBjbGFzcz1cImluZGV4XCI+JytcbiAgICAgICAgICAgIGNvdW50KycuICYjeDI1YjI7PC9zcGFuPiA8YSBocmVmPScrZC51cmwrJyBjbGFzcz1cImFydGljbGVUaXRsZVwiPicrZC50aXRsZSsnPC9hPicrXG4gICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJhcnRpY2xlVXJsXCI+Jytmb3JtYXRVcmwoZC51cmwpKyc8L3NwYW4+PC9kaXY+J30pXG5cbiAgICAgIFx0ZGl2cy5hcHBlbmQoJ2RpdicpXG4gICAgICBcdFx0LmF0dHIoJ2NsYXNzJywgJ2xpbmVUd28nKVxuICAgICAgXHRcdC5odG1sKGZ1bmN0aW9uKGQpe1xuICAgICAgXHRcdFx0cmV0dXJuICc8c3Bhbj4nK2Zvcm1hdFBvaW50cyhkLnNjb3JlKSsnIHBvaW50cyBieSA8YSBocmVmPWh0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vdXNlcj9pZD0nK1xuICAgICAgICAgICAgICAgIGQuYnkrJz4nK2QuYnkrJzwvYT4nK1xuICAgICAgICAgICAgICAgICc8YSBocmVmPWh0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vaXRlbT9pZD0nK2QuaWQrJz4nK2dldE1pbnV0ZXMoZC50aW1lKSsnPC9hPiB8ICcrXG4gICAgICAgICAgICAgICAgJzxhIGhyZWY9aHR0cHM6Ly9uZXdzLnljb21iaW5hdG9yLmNvbS9pdGVtP2lkPScrZC5pZCsnPicrZm9ybWF0Q29tbWVudHMoZC5kZXNjZW5kYW50cykrJzwvc3Bhbj4nfSlcbiAgICB9XG5cbiAgICByZWYuY2hpbGQoJ3RvcHN0b3JpZXMnKS5vbigndmFsdWUnLCBmdW5jdGlvbihzbmFwc2hvdCl7XG4gICAgICAgIHZhciBpZEFycmF5ID0gc25hcHNob3QudmFsKCkuc2xpY2UoMCxudW1TdG9yaWVzKTtcbiAgICAgICAgaGFja2VybmV3c0ZhY3RvcnkuZ2V0SE5TdG9yaWVzKGlkQXJyYXksdXJsKS50aGVuKGZ1bmN0aW9uKHRvcFN0b3JpZXMpe1xuICAgICAgICAgICAgY29uc29sZS5sb2codG9wU3Rvcmllcyk7XG4gICAgICAgICAgICB1cGRhdGUodG9wU3RvcmllcylcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3RvcE5ld3MnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy90b3BOZXdzL3RvcE5ld3MuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICd0b3BOZXdzQ3RybCdcbiAgICB9KTtcbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==