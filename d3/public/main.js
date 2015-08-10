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
app.controller('newestCtrl', function($scope, hackernewsFactory) {
  
    var update = function(data){
        var divs = d3.select('div.newStories').selectAll('div')
            .data(data, function(d){return d.id})

        divs.enter().append('div')

        divs.exit().remove()

      var count = 0;
        divs.html(function(d,index){
          count++;
            return '<div class="lineOne"><span class="index">'+
          count+'. &#x25b2;</span> <a href='+d.url+' class="articleTitle">'+d.title+'</a>'+
          '<span class="articleUrl">'+formatUrl(d.url)+'</span></div>'})

        divs.append('div')
            .attr('class', 'lineTwo')
            .html(function(d){
                return '<span>'+d.score+' points by <a href=https://news.ycombinator.com/user?id='+
              d.by+'>'+d.by+'</a>'+
              '<a href=https://news.ycombinator.com/item?id='+d.id+'>'+getMinutes(d.time)+'</a> | '+
              '<a href=https://news.ycombinator.com/item?id='+d.id+'>'+formatComments(d.descendants)+'</span>'})
          }

      hackernewsFactory.setHNnewStoriesAPIListener().then(function(itemArray){
          update(itemArray)
      });

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
          console.log(url)
          var result = url.replace(/.*?:\/\//g, "");
          if (result.indexOf('www.') === 0) {result = result.slice(4,result.length)}
              return '('+result.slice(0,result.indexOf('/'))+')';
      };

});
app.config(function ($stateProvider) {
    $stateProvider.state('newest', {
        url: '/newest',
        templateUrl: '/newest/newest.html',
        controller: 'newestCtrl'
    });
});
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
						console.log("topStories", itemArray)
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
						console.log("topStories", itemArray)
						deferred2.resolve(itemArray);
					}
				});
			});
		})

		return deferred2.promise;
	}

	return factory;
});
app.controller('topNewsCtrl', function($scope, hackernewsFactory) {

  var update = function(data){
  	var divs = d3.select('div.topNews').selectAll('div')
  		.data(data, function(d){return d.id})

  	divs.enter().append('div')

  	divs.exit().remove()

    var count = 0;
  	divs.html(function(d,index){
        count++;
  		return '<div class="lineOne"><span class="index">'+
        count+'. &#x25b2;</span> <a href='+d.url+' class="articleTitle">'+d.title+'</a>'+
        '<span class="articleUrl">'+formatUrl(d.url)+'</span></div>'})

  	divs.append('div')
  		.attr('class', 'lineTwo')
  		.html(function(d){
  			return '<span>'+d.score+' points by <a href=https://news.ycombinator.com/user?id='+
            d.by+'>'+d.by+'</a>'+
            '<a href=https://news.ycombinator.com/item?id='+d.id+'>'+getMinutes(d.time)+'</a> | '+
            '<a href=https://news.ycombinator.com/item?id='+d.id+'>'+formatComments(d.descendants)+'</span>'})
        }

    hackernewsFactory.setHNtopStoriesAPIListener().then(function(itemArray){
        update(itemArray)
    });

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
        console.log(url)
        var result = url.replace(/.*?:\/\//g, "");
        if (result.indexOf('www.') === 0) {result = result.slice(4,result.length)}
            return '('+result.slice(0,result.indexOf('/'))+')';
    };

});
app.config(function ($stateProvider) {
    $stateProvider.state('topNews', {
        url: '/',
        templateUrl: '/topNews/topNews.html',
        controller: 'topNewsCtrl'
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm5hdmJhci9uYXZiYXIuZGlyZWN0aXZlLmpzIiwibmV3ZXN0L25ld2VzdC5jb250cm9sbGVyLmpzIiwibmV3ZXN0L25ld2VzdC5zdGF0ZS5qcyIsInNlcnZpY2UvaGFja2VybmV3c0ZhY3RvcnkuanMiLCJ0b3BOZXdzL3RvcE5ld3MuY29udHJvbGxlci5qcyIsInRvcE5ld3MvdG9wTmV3cy5zdGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnaGFja2VybmV3cycsIFsndWkucm91dGVyJ10pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuXG5hcHAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUpIHtcbiAgJHJvb3RTY29wZS4kb24oXCIkc3RhdGVDaGFuZ2VFcnJvclwiLCBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpKTtcbn0pO1xuIiwiYXBwLmRpcmVjdGl2ZShcIm5hdmJhclwiLCBmdW5jdGlvbigpe1xuXHRyZXR1cm4ge1xuXHRcdHJlc3RyaWN0OiBcIkVcIixcblx0XHR0ZW1wbGF0ZVVybDogXCIvbmF2YmFyL25hdmJhci5odG1sXCJcblx0fTtcbn0pOyIsImFwcC5jb250cm9sbGVyKCduZXdlc3RDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBoYWNrZXJuZXdzRmFjdG9yeSkge1xuICBcbiAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIHZhciBkaXZzID0gZDMuc2VsZWN0KCdkaXYubmV3U3RvcmllcycpLnNlbGVjdEFsbCgnZGl2JylcbiAgICAgICAgICAgIC5kYXRhKGRhdGEsIGZ1bmN0aW9uKGQpe3JldHVybiBkLmlkfSlcblxuICAgICAgICBkaXZzLmVudGVyKCkuYXBwZW5kKCdkaXYnKVxuXG4gICAgICAgIGRpdnMuZXhpdCgpLnJlbW92ZSgpXG5cbiAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgIGRpdnMuaHRtbChmdW5jdGlvbihkLGluZGV4KXtcbiAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwibGluZU9uZVwiPjxzcGFuIGNsYXNzPVwiaW5kZXhcIj4nK1xuICAgICAgICAgIGNvdW50KycuICYjeDI1YjI7PC9zcGFuPiA8YSBocmVmPScrZC51cmwrJyBjbGFzcz1cImFydGljbGVUaXRsZVwiPicrZC50aXRsZSsnPC9hPicrXG4gICAgICAgICAgJzxzcGFuIGNsYXNzPVwiYXJ0aWNsZVVybFwiPicrZm9ybWF0VXJsKGQudXJsKSsnPC9zcGFuPjwvZGl2Pid9KVxuXG4gICAgICAgIGRpdnMuYXBwZW5kKCdkaXYnKVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2xpbmVUd28nKVxuICAgICAgICAgICAgLmh0bWwoZnVuY3Rpb24oZCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuICc8c3Bhbj4nK2Quc2NvcmUrJyBwb2ludHMgYnkgPGEgaHJlZj1odHRwczovL25ld3MueWNvbWJpbmF0b3IuY29tL3VzZXI/aWQ9JytcbiAgICAgICAgICAgICAgZC5ieSsnPicrZC5ieSsnPC9hPicrXG4gICAgICAgICAgICAgICc8YSBocmVmPWh0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vaXRlbT9pZD0nK2QuaWQrJz4nK2dldE1pbnV0ZXMoZC50aW1lKSsnPC9hPiB8ICcrXG4gICAgICAgICAgICAgICc8YSBocmVmPWh0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vaXRlbT9pZD0nK2QuaWQrJz4nK2Zvcm1hdENvbW1lbnRzKGQuZGVzY2VuZGFudHMpKyc8L3NwYW4+J30pXG4gICAgICAgICAgfVxuXG4gICAgICBoYWNrZXJuZXdzRmFjdG9yeS5zZXRITm5ld1N0b3JpZXNBUElMaXN0ZW5lcigpLnRoZW4oZnVuY3Rpb24oaXRlbUFycmF5KXtcbiAgICAgICAgICB1cGRhdGUoaXRlbUFycmF5KVxuICAgICAgfSk7XG5cbiAgICAgIGZ1bmN0aW9uIGdldE1pbnV0ZXModGltZSl7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IE1hdGguZmxvb3IoKERhdGUubm93KCktKHRpbWUqMTAwMCkpLzYwMDAwKTtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0IDwgNjAgPyByZXN1bHQrJyBtaW51dGVzIGFnbycgOiBNYXRoLmZsb29yKHJlc3VsdC82MCkrXG4gICAgICAgICAgICAoTWF0aC5mbG9vcihyZXN1bHQvNjApID09PSAxID8gJyBob3VyIGFnbycgOiAnIGhvdXJzIGFnbycpO1xuICAgICAgfTtcblxuICAgICAgZnVuY3Rpb24gZm9ybWF0Q29tbWVudHMobnVtQ29tbWVudHMpe1xuICAgICAgICAgIHJldHVybiAhbnVtQ29tbWVudHMgPyAnbm8gY29tbWVudHMnIDogKFxuICAgICAgICAgICAgICBudW1Db21tZW50cyA9PT0gMSA/IG51bUNvbW1lbnRzKycgY29tbWVudCcgOiBudW1Db21tZW50cysnIGNvbW1lbnRzJ1xuICAgICAgICAgICAgICApO1xuICAgICAgfTtcblxuICAgICAgZnVuY3Rpb24gZm9ybWF0VXJsKHVybCl7XG4gICAgICAgICAgaWYgKHVybCA9PT0gXCJcIiB8fCB1cmwgPT09IHVuZGVmaW5lZCl7cmV0dXJuIFwiXCJ9XG4gICAgICAgICAgY29uc29sZS5sb2codXJsKVxuICAgICAgICAgIHZhciByZXN1bHQgPSB1cmwucmVwbGFjZSgvLio/OlxcL1xcLy9nLCBcIlwiKTtcbiAgICAgICAgICBpZiAocmVzdWx0LmluZGV4T2YoJ3d3dy4nKSA9PT0gMCkge3Jlc3VsdCA9IHJlc3VsdC5zbGljZSg0LHJlc3VsdC5sZW5ndGgpfVxuICAgICAgICAgICAgICByZXR1cm4gJygnK3Jlc3VsdC5zbGljZSgwLHJlc3VsdC5pbmRleE9mKCcvJykpKycpJztcbiAgICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ25ld2VzdCcsIHtcbiAgICAgICAgdXJsOiAnL25ld2VzdCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL25ld2VzdC9uZXdlc3QuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICduZXdlc3RDdHJsJ1xuICAgIH0pO1xufSk7IiwiYXBwLmZhY3RvcnkoJ2hhY2tlcm5ld3NGYWN0b3J5JywgZnVuY3Rpb24oJHEpe1xuXHR2YXIgZmFjdG9yeSA9IHt9O1xuXHR2YXIgcmVmID0gbmV3IEZpcmViYXNlKFwiaHR0cHM6Ly9oYWNrZXItbmV3cy5maXJlYmFzZWlvLmNvbS92MC9cIik7XG5cdHZhciBpdGVtUmVmO1xuXHR2YXIgbnVtU3RvcmllcyA9IDMwO1xuXHR2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXHR2YXIgZGVmZXJyZWQyID0gJHEuZGVmZXIoKTtcblxuXHRmYWN0b3J5LnNldEhOdG9wU3Rvcmllc0FQSUxpc3RlbmVyID0gZnVuY3Rpb24oKXtcblxuXHRcdHJlZi5jaGlsZCgndG9wc3RvcmllcycpLm9uKCd2YWx1ZScsIGZ1bmN0aW9uKHNuYXBzaG90KXtcblx0XHRcdHZhciBpZEFycmF5ID0gc25hcHNob3QudmFsKCkuc2xpY2UoMCxudW1TdG9yaWVzKTtcblx0XHRcdHZhciBpdGVtQXJyYXkgPSBbXVxuXHRcdFx0aWRBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcblx0XHRcdFx0cmVmLmNoaWxkKCdpdGVtLycraWQpLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcCl7XG5cdFx0XHRcdFx0aXRlbUFycmF5LnB1c2goc25hcC52YWwoKSlcblx0XHRcdFx0XHRpZiAoaXRlbUFycmF5Lmxlbmd0aCA+PSBpZEFycmF5Lmxlbmd0aCl7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhcInRvcFN0b3JpZXNcIiwgaXRlbUFycmF5KVxuXHRcdFx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShpdGVtQXJyYXkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9KVxuXG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG5cdH1cblxuXHRmYWN0b3J5LnNldEhObmV3U3Rvcmllc0FQSUxpc3RlbmVyID0gZnVuY3Rpb24oKXtcblxuXHRcdHJlZi5jaGlsZCgnbmV3c3RvcmllcycpLm9uKCd2YWx1ZScsIGZ1bmN0aW9uKHNuYXBzaG90KXtcblx0XHRcdHZhciBpZEFycmF5ID0gc25hcHNob3QudmFsKCkuc2xpY2UoMCxudW1TdG9yaWVzKTtcblx0XHRcdHZhciBpdGVtQXJyYXkgPSBbXVxuXHRcdFx0aWRBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcblx0XHRcdFx0cmVmLmNoaWxkKCdpdGVtLycraWQpLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcCl7XG5cdFx0XHRcdFx0aXRlbUFycmF5LnB1c2goc25hcC52YWwoKSlcblx0XHRcdFx0XHRpZiAoaXRlbUFycmF5Lmxlbmd0aCA+PSBpZEFycmF5Lmxlbmd0aCl7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhcInRvcFN0b3JpZXNcIiwgaXRlbUFycmF5KVxuXHRcdFx0XHRcdFx0ZGVmZXJyZWQyLnJlc29sdmUoaXRlbUFycmF5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSlcblxuXHRcdHJldHVybiBkZWZlcnJlZDIucHJvbWlzZTtcblx0fVxuXG5cdHJldHVybiBmYWN0b3J5O1xufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ3RvcE5ld3NDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBoYWNrZXJuZXdzRmFjdG9yeSkge1xuXG4gIHZhciB1cGRhdGUgPSBmdW5jdGlvbihkYXRhKXtcbiAgXHR2YXIgZGl2cyA9IGQzLnNlbGVjdCgnZGl2LnRvcE5ld3MnKS5zZWxlY3RBbGwoJ2RpdicpXG4gIFx0XHQuZGF0YShkYXRhLCBmdW5jdGlvbihkKXtyZXR1cm4gZC5pZH0pXG5cbiAgXHRkaXZzLmVudGVyKCkuYXBwZW5kKCdkaXYnKVxuXG4gIFx0ZGl2cy5leGl0KCkucmVtb3ZlKClcblxuICAgIHZhciBjb3VudCA9IDA7XG4gIFx0ZGl2cy5odG1sKGZ1bmN0aW9uKGQsaW5kZXgpe1xuICAgICAgICBjb3VudCsrO1xuICBcdFx0cmV0dXJuICc8ZGl2IGNsYXNzPVwibGluZU9uZVwiPjxzcGFuIGNsYXNzPVwiaW5kZXhcIj4nK1xuICAgICAgICBjb3VudCsnLiAmI3gyNWIyOzwvc3Bhbj4gPGEgaHJlZj0nK2QudXJsKycgY2xhc3M9XCJhcnRpY2xlVGl0bGVcIj4nK2QudGl0bGUrJzwvYT4nK1xuICAgICAgICAnPHNwYW4gY2xhc3M9XCJhcnRpY2xlVXJsXCI+Jytmb3JtYXRVcmwoZC51cmwpKyc8L3NwYW4+PC9kaXY+J30pXG5cbiAgXHRkaXZzLmFwcGVuZCgnZGl2JylcbiAgXHRcdC5hdHRyKCdjbGFzcycsICdsaW5lVHdvJylcbiAgXHRcdC5odG1sKGZ1bmN0aW9uKGQpe1xuICBcdFx0XHRyZXR1cm4gJzxzcGFuPicrZC5zY29yZSsnIHBvaW50cyBieSA8YSBocmVmPWh0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vdXNlcj9pZD0nK1xuICAgICAgICAgICAgZC5ieSsnPicrZC5ieSsnPC9hPicrXG4gICAgICAgICAgICAnPGEgaHJlZj1odHRwczovL25ld3MueWNvbWJpbmF0b3IuY29tL2l0ZW0/aWQ9JytkLmlkKyc+JytnZXRNaW51dGVzKGQudGltZSkrJzwvYT4gfCAnK1xuICAgICAgICAgICAgJzxhIGhyZWY9aHR0cHM6Ly9uZXdzLnljb21iaW5hdG9yLmNvbS9pdGVtP2lkPScrZC5pZCsnPicrZm9ybWF0Q29tbWVudHMoZC5kZXNjZW5kYW50cykrJzwvc3Bhbj4nfSlcbiAgICAgICAgfVxuXG4gICAgaGFja2VybmV3c0ZhY3Rvcnkuc2V0SE50b3BTdG9yaWVzQVBJTGlzdGVuZXIoKS50aGVuKGZ1bmN0aW9uKGl0ZW1BcnJheSl7XG4gICAgICAgIHVwZGF0ZShpdGVtQXJyYXkpXG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBnZXRNaW51dGVzKHRpbWUpe1xuICAgICAgICB2YXIgcmVzdWx0ID0gTWF0aC5mbG9vcigoRGF0ZS5ub3coKS0odGltZSoxMDAwKSkvNjAwMDApO1xuICAgICAgICByZXR1cm4gcmVzdWx0IDwgNjAgPyByZXN1bHQrJyBtaW51dGVzIGFnbycgOiBNYXRoLmZsb29yKHJlc3VsdC82MCkrXG4gICAgICAgICAgKE1hdGguZmxvb3IocmVzdWx0LzYwKSA9PT0gMSA/ICcgaG91ciBhZ28nIDogJyBob3VycyBhZ28nKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZm9ybWF0Q29tbWVudHMobnVtQ29tbWVudHMpe1xuICAgICAgICByZXR1cm4gIW51bUNvbW1lbnRzID8gJ25vIGNvbW1lbnRzJyA6IChcbiAgICAgICAgICAgIG51bUNvbW1lbnRzID09PSAxID8gbnVtQ29tbWVudHMrJyBjb21tZW50JyA6IG51bUNvbW1lbnRzKycgY29tbWVudHMnXG4gICAgICAgICAgICApO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBmb3JtYXRVcmwodXJsKXtcbiAgICAgICAgaWYgKHVybCA9PT0gXCJcIiB8fCB1cmwgPT09IHVuZGVmaW5lZCl7cmV0dXJuIFwiXCJ9XG4gICAgICAgIGNvbnNvbGUubG9nKHVybClcbiAgICAgICAgdmFyIHJlc3VsdCA9IHVybC5yZXBsYWNlKC8uKj86XFwvXFwvL2csIFwiXCIpO1xuICAgICAgICBpZiAocmVzdWx0LmluZGV4T2YoJ3d3dy4nKSA9PT0gMCkge3Jlc3VsdCA9IHJlc3VsdC5zbGljZSg0LHJlc3VsdC5sZW5ndGgpfVxuICAgICAgICAgICAgcmV0dXJuICcoJytyZXN1bHQuc2xpY2UoMCxyZXN1bHQuaW5kZXhPZignLycpKSsnKSc7XG4gICAgfTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndG9wTmV3cycsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3RvcE5ld3MvdG9wTmV3cy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3RvcE5ld3NDdHJsJ1xuICAgIH0pO1xufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9