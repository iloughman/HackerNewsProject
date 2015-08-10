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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm5hdmJhci9uYXZiYXIuZGlyZWN0aXZlLmpzIiwibmV3ZXN0L25ld2VzdC5jb250cm9sbGVyLmpzIiwibmV3ZXN0L25ld2VzdC5zdGF0ZS5qcyIsInNlcnZpY2UvaGFja2VybmV3c0ZhY3RvcnkuanMiLCJ0b3BOZXdzL3RvcE5ld3MuY29udHJvbGxlci5qcyIsInRvcE5ld3MvdG9wTmV3cy5zdGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2hhY2tlcm5ld3MnLCBbJ3VpLnJvdXRlciddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcblxuYXBwLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlKSB7XG4gICRyb290U2NvcGUuJG9uKFwiJHN0YXRlQ2hhbmdlRXJyb3JcIiwgY29uc29sZS5sb2cuYmluZChjb25zb2xlKSk7XG59KTtcbiIsImFwcC5kaXJlY3RpdmUoXCJuYXZiYXJcIiwgZnVuY3Rpb24oKXtcblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogXCJFXCIsXG5cdFx0dGVtcGxhdGVVcmw6IFwiL25hdmJhci9uYXZiYXIuaHRtbFwiXG5cdH07XG59KTsiLCJhcHAuY29udHJvbGxlcignbmV3ZXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgaGFja2VybmV3c0ZhY3RvcnkpIHtcbiAgXG4gICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICB2YXIgZGl2cyA9IGQzLnNlbGVjdCgnZGl2Lm5ld1N0b3JpZXMnKS5zZWxlY3RBbGwoJ2RpdicpXG4gICAgICAgICAgICAuZGF0YShkYXRhLCBmdW5jdGlvbihkKXtyZXR1cm4gZC5pZH0pXG5cbiAgICAgICAgZGl2cy5lbnRlcigpLmFwcGVuZCgnZGl2JylcblxuICAgICAgICBkaXZzLmV4aXQoKS5yZW1vdmUoKVxuXG4gICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICBkaXZzLmh0bWwoZnVuY3Rpb24oZCxpbmRleCl7XG4gICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImxpbmVPbmVcIj48c3BhbiBjbGFzcz1cImluZGV4XCI+JytcbiAgICAgICAgICBjb3VudCsnLiAmI3gyNWIyOzwvc3Bhbj4gPGEgaHJlZj0nK2QudXJsKycgY2xhc3M9XCJhcnRpY2xlVGl0bGVcIj4nK2QudGl0bGUrJzwvYT4nK1xuICAgICAgICAgICc8c3BhbiBjbGFzcz1cImFydGljbGVVcmxcIj4nK2Zvcm1hdFVybChkLnVybCkrJzwvc3Bhbj48L2Rpdj4nfSlcblxuICAgICAgICBkaXZzLmFwcGVuZCgnZGl2JylcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdsaW5lVHdvJylcbiAgICAgICAgICAgIC5odG1sKGZ1bmN0aW9uKGQpe1xuICAgICAgICAgICAgICAgIHJldHVybiAnPHNwYW4+JytkLnNjb3JlKycgcG9pbnRzIGJ5IDxhIGhyZWY9aHR0cHM6Ly9uZXdzLnljb21iaW5hdG9yLmNvbS91c2VyP2lkPScrXG4gICAgICAgICAgICAgIGQuYnkrJz4nK2QuYnkrJzwvYT4nK1xuICAgICAgICAgICAgICAnPGEgaHJlZj1odHRwczovL25ld3MueWNvbWJpbmF0b3IuY29tL2l0ZW0/aWQ9JytkLmlkKyc+JytnZXRNaW51dGVzKGQudGltZSkrJzwvYT4gfCAnK1xuICAgICAgICAgICAgICAnPGEgaHJlZj1odHRwczovL25ld3MueWNvbWJpbmF0b3IuY29tL2l0ZW0/aWQ9JytkLmlkKyc+Jytmb3JtYXRDb21tZW50cyhkLmRlc2NlbmRhbnRzKSsnPC9zcGFuPid9KVxuICAgICAgICAgIH1cblxuICAgICAgaGFja2VybmV3c0ZhY3Rvcnkuc2V0SE5uZXdTdG9yaWVzQVBJTGlzdGVuZXIoKS50aGVuKGZ1bmN0aW9uKGl0ZW1BcnJheSl7XG4gICAgICAgICAgdXBkYXRlKGl0ZW1BcnJheSlcbiAgICAgIH0pO1xuXG4gICAgICBmdW5jdGlvbiBnZXRNaW51dGVzKHRpbWUpe1xuICAgICAgICAgIHZhciByZXN1bHQgPSBNYXRoLmZsb29yKChEYXRlLm5vdygpLSh0aW1lKjEwMDApKS82MDAwMCk7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdCA8IDYwID8gcmVzdWx0KycgbWludXRlcyBhZ28nIDogTWF0aC5mbG9vcihyZXN1bHQvNjApK1xuICAgICAgICAgICAgKE1hdGguZmxvb3IocmVzdWx0LzYwKSA9PT0gMSA/ICcgaG91ciBhZ28nIDogJyBob3VycyBhZ28nKTtcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIGZvcm1hdENvbW1lbnRzKG51bUNvbW1lbnRzKXtcbiAgICAgICAgICByZXR1cm4gIW51bUNvbW1lbnRzID8gJ25vIGNvbW1lbnRzJyA6IChcbiAgICAgICAgICAgICAgbnVtQ29tbWVudHMgPT09IDEgPyBudW1Db21tZW50cysnIGNvbW1lbnQnIDogbnVtQ29tbWVudHMrJyBjb21tZW50cydcbiAgICAgICAgICAgICAgKTtcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIGZvcm1hdFVybCh1cmwpe1xuICAgICAgICAgIGlmICh1cmwgPT09IFwiXCIgfHwgdXJsID09PSB1bmRlZmluZWQpe3JldHVybiBcIlwifVxuICAgICAgICAgIHZhciByZXN1bHQgPSB1cmwucmVwbGFjZSgvLio/OlxcL1xcLy9nLCBcIlwiKTtcbiAgICAgICAgICBpZiAocmVzdWx0LmluZGV4T2YoJ3d3dy4nKSA9PT0gMCkge3Jlc3VsdCA9IHJlc3VsdC5zbGljZSg0LHJlc3VsdC5sZW5ndGgpfVxuICAgICAgICAgICAgICByZXR1cm4gJygnK3Jlc3VsdC5zbGljZSgwLHJlc3VsdC5pbmRleE9mKCcvJykpKycpJztcbiAgICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ25ld2VzdCcsIHtcbiAgICAgICAgdXJsOiAnL25ld2VzdCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL25ld2VzdC9uZXdlc3QuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICduZXdlc3RDdHJsJ1xuICAgIH0pO1xufSk7IiwiYXBwLmZhY3RvcnkoJ2hhY2tlcm5ld3NGYWN0b3J5JywgZnVuY3Rpb24oJHEpe1xuXHR2YXIgZmFjdG9yeSA9IHt9O1xuXHR2YXIgcmVmID0gbmV3IEZpcmViYXNlKFwiaHR0cHM6Ly9oYWNrZXItbmV3cy5maXJlYmFzZWlvLmNvbS92MC9cIik7XG5cdHZhciBpdGVtUmVmO1xuXHR2YXIgbnVtU3RvcmllcyA9IDMwO1xuXHR2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXHR2YXIgZGVmZXJyZWQyID0gJHEuZGVmZXIoKTtcblxuXHRmYWN0b3J5LnNldEhOdG9wU3Rvcmllc0FQSUxpc3RlbmVyID0gZnVuY3Rpb24oKXtcblxuXHRcdHJlZi5jaGlsZCgndG9wc3RvcmllcycpLm9uKCd2YWx1ZScsIGZ1bmN0aW9uKHNuYXBzaG90KXtcblx0XHRcdHZhciBpZEFycmF5ID0gc25hcHNob3QudmFsKCkuc2xpY2UoMCxudW1TdG9yaWVzKTtcblx0XHRcdHZhciBpdGVtQXJyYXkgPSBbXVxuXHRcdFx0aWRBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcblx0XHRcdFx0cmVmLmNoaWxkKCdpdGVtLycraWQpLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcCl7XG5cdFx0XHRcdFx0aXRlbUFycmF5LnB1c2goc25hcC52YWwoKSlcblx0XHRcdFx0XHRpZiAoaXRlbUFycmF5Lmxlbmd0aCA+PSBpZEFycmF5Lmxlbmd0aCl7XG5cdFx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKGl0ZW1BcnJheSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0pXG5cblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0fVxuXG5cdGZhY3Rvcnkuc2V0SE5uZXdTdG9yaWVzQVBJTGlzdGVuZXIgPSBmdW5jdGlvbigpe1xuXG5cdFx0cmVmLmNoaWxkKCduZXdzdG9yaWVzJykub24oJ3ZhbHVlJywgZnVuY3Rpb24oc25hcHNob3Qpe1xuXHRcdFx0dmFyIGlkQXJyYXkgPSBzbmFwc2hvdC52YWwoKS5zbGljZSgwLG51bVN0b3JpZXMpO1xuXHRcdFx0dmFyIGl0ZW1BcnJheSA9IFtdXG5cdFx0XHRpZEFycmF5LmZvckVhY2goZnVuY3Rpb24oaWQpe1xuXHRcdFx0XHRyZWYuY2hpbGQoJ2l0ZW0vJytpZCkub25jZSgndmFsdWUnLCBmdW5jdGlvbihzbmFwKXtcblx0XHRcdFx0XHRpdGVtQXJyYXkucHVzaChzbmFwLnZhbCgpKVxuXHRcdFx0XHRcdGlmIChpdGVtQXJyYXkubGVuZ3RoID49IGlkQXJyYXkubGVuZ3RoKXtcblx0XHRcdFx0XHRcdGRlZmVycmVkMi5yZXNvbHZlKGl0ZW1BcnJheSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0pXG5cblx0XHRyZXR1cm4gZGVmZXJyZWQyLnByb21pc2U7XG5cdH1cblxuXHRyZXR1cm4gZmFjdG9yeTtcbn0pOyIsImFwcC5jb250cm9sbGVyKCd0b3BOZXdzQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgaGFja2VybmV3c0ZhY3RvcnkpIHtcblxuICB2YXIgdXBkYXRlID0gZnVuY3Rpb24oZGF0YSl7XG4gIFx0dmFyIGRpdnMgPSBkMy5zZWxlY3QoJ2Rpdi50b3BOZXdzJykuc2VsZWN0QWxsKCdkaXYnKVxuICBcdFx0LmRhdGEoZGF0YSwgZnVuY3Rpb24oZCl7cmV0dXJuIGQuaWR9KVxuXG4gIFx0ZGl2cy5lbnRlcigpLmFwcGVuZCgnZGl2JylcblxuICBcdGRpdnMuZXhpdCgpLnJlbW92ZSgpXG5cbiAgICB2YXIgY291bnQgPSAwO1xuICBcdGRpdnMuaHRtbChmdW5jdGlvbihkLGluZGV4KXtcbiAgICAgICAgY291bnQrKztcbiAgXHRcdHJldHVybiAnPGRpdiBjbGFzcz1cImxpbmVPbmVcIj48c3BhbiBjbGFzcz1cImluZGV4XCI+JytcbiAgICAgICAgY291bnQrJy4gJiN4MjViMjs8L3NwYW4+IDxhIGhyZWY9JytkLnVybCsnIGNsYXNzPVwiYXJ0aWNsZVRpdGxlXCI+JytkLnRpdGxlKyc8L2E+JytcbiAgICAgICAgJzxzcGFuIGNsYXNzPVwiYXJ0aWNsZVVybFwiPicrZm9ybWF0VXJsKGQudXJsKSsnPC9zcGFuPjwvZGl2Pid9KVxuXG4gIFx0ZGl2cy5hcHBlbmQoJ2RpdicpXG4gIFx0XHQuYXR0cignY2xhc3MnLCAnbGluZVR3bycpXG4gIFx0XHQuaHRtbChmdW5jdGlvbihkKXtcbiAgXHRcdFx0cmV0dXJuICc8c3Bhbj4nK2Quc2NvcmUrJyBwb2ludHMgYnkgPGEgaHJlZj1odHRwczovL25ld3MueWNvbWJpbmF0b3IuY29tL3VzZXI/aWQ9JytcbiAgICAgICAgICAgIGQuYnkrJz4nK2QuYnkrJzwvYT4nK1xuICAgICAgICAgICAgJzxhIGhyZWY9aHR0cHM6Ly9uZXdzLnljb21iaW5hdG9yLmNvbS9pdGVtP2lkPScrZC5pZCsnPicrZ2V0TWludXRlcyhkLnRpbWUpKyc8L2E+IHwgJytcbiAgICAgICAgICAgICc8YSBocmVmPWh0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vaXRlbT9pZD0nK2QuaWQrJz4nK2Zvcm1hdENvbW1lbnRzKGQuZGVzY2VuZGFudHMpKyc8L3NwYW4+J30pXG4gICAgICAgIH1cblxuICAgIGhhY2tlcm5ld3NGYWN0b3J5LnNldEhOdG9wU3Rvcmllc0FQSUxpc3RlbmVyKCkudGhlbihmdW5jdGlvbihpdGVtQXJyYXkpe1xuICAgICAgICB1cGRhdGUoaXRlbUFycmF5KVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZ2V0TWludXRlcyh0aW1lKXtcbiAgICAgICAgdmFyIHJlc3VsdCA9IE1hdGguZmxvb3IoKERhdGUubm93KCktKHRpbWUqMTAwMCkpLzYwMDAwKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCA8IDYwID8gcmVzdWx0KycgbWludXRlcyBhZ28nIDogTWF0aC5mbG9vcihyZXN1bHQvNjApK1xuICAgICAgICAgIChNYXRoLmZsb29yKHJlc3VsdC82MCkgPT09IDEgPyAnIGhvdXIgYWdvJyA6ICcgaG91cnMgYWdvJyk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGZvcm1hdENvbW1lbnRzKG51bUNvbW1lbnRzKXtcbiAgICAgICAgcmV0dXJuICFudW1Db21tZW50cyA/ICdubyBjb21tZW50cycgOiAoXG4gICAgICAgICAgICBudW1Db21tZW50cyA9PT0gMSA/IG51bUNvbW1lbnRzKycgY29tbWVudCcgOiBudW1Db21tZW50cysnIGNvbW1lbnRzJ1xuICAgICAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZm9ybWF0VXJsKHVybCl7XG4gICAgICAgIGlmICh1cmwgPT09IFwiXCIgfHwgdXJsID09PSB1bmRlZmluZWQpe3JldHVybiBcIlwifVxuICAgICAgICB2YXIgcmVzdWx0ID0gdXJsLnJlcGxhY2UoLy4qPzpcXC9cXC8vZywgXCJcIik7XG4gICAgICAgIGlmIChyZXN1bHQuaW5kZXhPZignd3d3LicpID09PSAwKSB7cmVzdWx0ID0gcmVzdWx0LnNsaWNlKDQscmVzdWx0Lmxlbmd0aCl9XG4gICAgICAgICAgICByZXR1cm4gJygnK3Jlc3VsdC5zbGljZSgwLHJlc3VsdC5pbmRleE9mKCcvJykpKycpJztcbiAgICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd0b3BOZXdzJywge1xuICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvdG9wTmV3cy90b3BOZXdzLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAndG9wTmV3c0N0cmwnXG4gICAgfSk7XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=