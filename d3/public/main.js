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
    var formatUrl = formatFactory.formatUrl

  
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
                return '<span>'+d.score+' points by <a href=https://news.ycombinator.com/user?id='+
                    d.by+'>'+d.by+'</a>'+
                    '<a href=https://news.ycombinator.com/item?id='+d.id+'>'+getMinutes(d.time)+'</a> | '+
                    '<a href=https://news.ycombinator.com/item?id='+d.id+'>'+formatComments(d.descendants)+'</span>'})
    }

    ref.child('newstories').on('value', function(snapshot){
        var idArray = snapshot.val().slice(0,numStories);
        hackernewsFactory.getNewHNStories(idArray,url).then(function(newStories){
            console.log('newStories', newStories)
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
					console.log("item", itemArray)
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
					console.log("item", itemArray)
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
    var formatUrl = formatFactory.formatUrl

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
      			return '<span>'+d.score+' points by <a href=https://news.ycombinator.com/user?id='+
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm5hdmJhci9uYXZiYXIuZGlyZWN0aXZlLmpzIiwibmV3ZXN0L25ld2VzdC5jb250cm9sbGVyLmpzIiwibmV3ZXN0L25ld2VzdC5zdGF0ZS5qcyIsInNlcnZpY2UvZm9ybWF0RmFjdG9yeS5qcyIsInNlcnZpY2UvaGFja2VybmV3c0ZhY3RvcnkuanMiLCJ0b3BOZXdzL3RvcE5ld3MuY29udHJvbGxlci5qcyIsInRvcE5ld3MvdG9wTmV3cy5zdGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2hhY2tlcm5ld3MnLCBbJ3VpLnJvdXRlciddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcblxuYXBwLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlKSB7XG4gICRyb290U2NvcGUuJG9uKFwiJHN0YXRlQ2hhbmdlRXJyb3JcIiwgY29uc29sZS5sb2cuYmluZChjb25zb2xlKSk7XG59KTtcbiIsImFwcC5kaXJlY3RpdmUoXCJuYXZiYXJcIiwgZnVuY3Rpb24oKXtcblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogXCJFXCIsXG5cdFx0dGVtcGxhdGVVcmw6IFwiL25hdmJhci9uYXZiYXIuaHRtbFwiXG5cdH07XG59KTsiLCJhcHAuY29udHJvbGxlcignbmV3ZXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgaGFja2VybmV3c0ZhY3RvcnksIGZvcm1hdEZhY3RvcnkpIHtcbiAgIFxuICAgIHZhciB1cmwgPSBcImh0dHBzOi8vaGFja2VyLW5ld3MuZmlyZWJhc2Vpby5jb20vdjAvXCI7XG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZSh1cmwpO1xuICAgIHZhciBudW1TdG9yaWVzID0gMzA7XG4gICAgdmFyIGdldE1pbnV0ZXMgPSBmb3JtYXRGYWN0b3J5LmdldE1pbnV0ZXM7XG4gICAgdmFyIGZvcm1hdENvbW1lbnRzID0gZm9ybWF0RmFjdG9yeS5mb3JtYXRDb21tZW50cztcbiAgICB2YXIgZm9ybWF0VXJsID0gZm9ybWF0RmFjdG9yeS5mb3JtYXRVcmxcblxuICBcbiAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIHZhciBkaXZzID0gZDMuc2VsZWN0KCdkaXYubmV3U3RvcmllcycpLnNlbGVjdEFsbCgnZGl2JylcbiAgICAgICAgICAgIC5kYXRhKGRhdGEsIGZ1bmN0aW9uKGQpe1xuICAgICAgICAgICAgICAgIGlmIChkKSB7cmV0dXJuIGQuaWR9fSlcblxuICAgICAgICBkaXZzLmVudGVyKCkuYXBwZW5kKCdkaXYnKTtcblxuICAgICAgICBkaXZzLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgICAgZGl2cy5vcmRlcigpO1xuICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICBkaXZzLmh0bWwoZnVuY3Rpb24oZCxpbmRleCl7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwibGluZU9uZVwiPjxzcGFuIGNsYXNzPVwiaW5kZXhcIj4nK1xuICAgICAgICAgICAgICAgIGNvdW50KycuICYjeDI1YjI7PC9zcGFuPiA8YSBocmVmPScrZC51cmwrJyBjbGFzcz1cImFydGljbGVUaXRsZVwiPicrZC50aXRsZSsnPC9hPicrXG4gICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiYXJ0aWNsZVVybFwiPicrZm9ybWF0VXJsKGQudXJsKSsnPC9zcGFuPjwvZGl2Pid9KVxuXG4gICAgICAgIGRpdnMuYXBwZW5kKCdkaXYnKVxuICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2xpbmVUd28nKVxuICAgICAgICAgICAgLmh0bWwoZnVuY3Rpb24oZCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuICc8c3Bhbj4nK2Quc2NvcmUrJyBwb2ludHMgYnkgPGEgaHJlZj1odHRwczovL25ld3MueWNvbWJpbmF0b3IuY29tL3VzZXI/aWQ9JytcbiAgICAgICAgICAgICAgICAgICAgZC5ieSsnPicrZC5ieSsnPC9hPicrXG4gICAgICAgICAgICAgICAgICAgICc8YSBocmVmPWh0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vaXRlbT9pZD0nK2QuaWQrJz4nK2dldE1pbnV0ZXMoZC50aW1lKSsnPC9hPiB8ICcrXG4gICAgICAgICAgICAgICAgICAgICc8YSBocmVmPWh0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vaXRlbT9pZD0nK2QuaWQrJz4nK2Zvcm1hdENvbW1lbnRzKGQuZGVzY2VuZGFudHMpKyc8L3NwYW4+J30pXG4gICAgfVxuXG4gICAgcmVmLmNoaWxkKCduZXdzdG9yaWVzJykub24oJ3ZhbHVlJywgZnVuY3Rpb24oc25hcHNob3Qpe1xuICAgICAgICB2YXIgaWRBcnJheSA9IHNuYXBzaG90LnZhbCgpLnNsaWNlKDAsbnVtU3Rvcmllcyk7XG4gICAgICAgIGhhY2tlcm5ld3NGYWN0b3J5LmdldE5ld0hOU3RvcmllcyhpZEFycmF5LHVybCkudGhlbihmdW5jdGlvbihuZXdTdG9yaWVzKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCduZXdTdG9yaWVzJywgbmV3U3RvcmllcylcbiAgICAgICAgICAgIHVwZGF0ZShuZXdTdG9yaWVzKVxuICAgICAgICB9KTtcbiAgICB9KTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbmV3ZXN0Jywge1xuICAgICAgICB1cmw6ICcvbmV3ZXN0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvbmV3ZXN0L25ld2VzdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ25ld2VzdEN0cmwnXG4gICAgfSk7XG59KTsiLCJhcHAuZmFjdG9yeSgnZm9ybWF0RmFjdG9yeScsIGZ1bmN0aW9uKCl7XG5cdHZhciBmYWN0b3J5ID0ge307XG5cdGZhY3RvcnkuZ2V0TWludXRlcyA9IGZ1bmN0aW9uKHRpbWUpe1xuXHQgICAgdmFyIHJlc3VsdCA9IE1hdGguZmxvb3IoKERhdGUubm93KCktKHRpbWUqMTAwMCkpLzYwMDAwKTtcblx0ICAgIHJldHVybiByZXN1bHQgPCA2MCA/IHJlc3VsdCsnIG1pbnV0ZXMgYWdvJyA6IE1hdGguZmxvb3IocmVzdWx0LzYwKStcblx0ICAgICAgKE1hdGguZmxvb3IocmVzdWx0LzYwKSA9PT0gMSA/ICcgaG91ciBhZ28nIDogJyBob3VycyBhZ28nKTtcblx0fTtcblxuXHRmYWN0b3J5LmZvcm1hdENvbW1lbnRzID0gZnVuY3Rpb24obnVtQ29tbWVudHMpe1xuXHQgICAgcmV0dXJuICFudW1Db21tZW50cyA/ICdubyBjb21tZW50cycgOiAoXG5cdCAgICAgICAgbnVtQ29tbWVudHMgPT09IDEgPyBudW1Db21tZW50cysnIGNvbW1lbnQnIDogbnVtQ29tbWVudHMrJyBjb21tZW50cydcblx0ICAgICAgICApO1xuXHR9O1xuXG5cdGZhY3RvcnkuZm9ybWF0VXJsID0gZnVuY3Rpb24odXJsKXtcblx0ICAgIGlmICh1cmwgPT09IFwiXCIgfHwgdXJsID09PSB1bmRlZmluZWQpe3JldHVybiBcIlwifVxuXHQgICAgdmFyIHJlc3VsdCA9IHVybC5yZXBsYWNlKC8uKj86XFwvXFwvL2csIFwiXCIpO1xuXHQgICAgaWYgKHJlc3VsdC5pbmRleE9mKCd3d3cuJykgPT09IDApIHtyZXN1bHQgPSByZXN1bHQuc2xpY2UoNCxyZXN1bHQubGVuZ3RoKX1cblx0ICAgICAgICByZXR1cm4gJygnK3Jlc3VsdC5zbGljZSgwLHJlc3VsdC5pbmRleE9mKCcvJykpKycpJztcblx0fTtcblx0cmV0dXJuIGZhY3Rvcnk7XG59KTsiLCJhcHAuZmFjdG9yeSgnaGFja2VybmV3c0ZhY3RvcnknLCBmdW5jdGlvbigkcSl7XG5cdHZhciBmYWN0b3J5ID0ge307XG5cblx0ZmFjdG9yeS5nZXRITlN0b3JpZXMgPSBmdW5jdGlvbihpZEFycmF5LHVybCl7XG5cblx0XHR2YXIgcmVmID0gbmV3IEZpcmViYXNlKHVybCk7XG5cdFx0dmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblx0XHR2YXIgaXRlbUFycmF5ID0gW11cblxuXHRcdGlkQXJyYXkuZm9yRWFjaChmdW5jdGlvbihpZCl7XG5cdFx0XHRyZWYuY2hpbGQoJ2l0ZW0vJytpZCkub25jZSgndmFsdWUnLCBmdW5jdGlvbihzbmFwKXtcblx0XHRcdFx0aXRlbUFycmF5LnB1c2goc25hcC52YWwoKSlcblx0XHRcdFx0aWYgKGl0ZW1BcnJheS5sZW5ndGggPj0gaWRBcnJheS5sZW5ndGgpe1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiaXRlbVwiLCBpdGVtQXJyYXkpXG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShpdGVtQXJyYXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXHR9XG5cblx0ZmFjdG9yeS5nZXROZXdITlN0b3JpZXMgPSBmdW5jdGlvbihpZEFycmF5LHVybCl7XG5cblx0XHR2YXIgcmVmID0gbmV3IEZpcmViYXNlKHVybCk7XG5cdFx0dmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblx0XHR2YXIgaXRlbUFycmF5ID0gW11cblxuXHRcdGlkQXJyYXkuZm9yRWFjaChmdW5jdGlvbihpZCl7XG5cdFx0XHRyZWYuY2hpbGQoJ2l0ZW0vJytpZCkub25jZSgndmFsdWUnLCBmdW5jdGlvbihzbmFwKXtcblx0XHRcdFx0aXRlbUFycmF5LnB1c2goc25hcC52YWwoKSlcblx0XHRcdFx0aWYgKGl0ZW1BcnJheS5sZW5ndGggPj0gaWRBcnJheS5sZW5ndGgpe1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiaXRlbVwiLCBpdGVtQXJyYXkpXG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShpdGVtQXJyYXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHRcblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0fVxuXG5cdHJldHVybiBmYWN0b3J5O1xufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ3RvcE5ld3NDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBoYWNrZXJuZXdzRmFjdG9yeSwgZm9ybWF0RmFjdG9yeSkge1xuICAgIFxuICAgIHZhciB1cmwgPSBcImh0dHBzOi8vaGFja2VyLW5ld3MuZmlyZWJhc2Vpby5jb20vdjAvXCI7XG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZSh1cmwpO1xuICAgIHZhciBudW1TdG9yaWVzID0gMzA7XG4gICAgdmFyIGdldE1pbnV0ZXMgPSBmb3JtYXRGYWN0b3J5LmdldE1pbnV0ZXM7XG4gICAgdmFyIGZvcm1hdENvbW1lbnRzID0gZm9ybWF0RmFjdG9yeS5mb3JtYXRDb21tZW50cztcbiAgICB2YXIgZm9ybWF0VXJsID0gZm9ybWF0RmFjdG9yeS5mb3JtYXRVcmxcblxuICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdmFyIGRpdnMgPSBkMy5zZWxlY3QoJ2Rpdi50b3BOZXdzJykuc2VsZWN0QWxsKCdkaXYnKVxuICBcdFx0ICAgIC5kYXRhKGRhdGEsIGZ1bmN0aW9uKGQpe1xuICAgICAgICAgICAgICAgIGlmIChkKSB7cmV0dXJuIGQuaWR9fSlcblxuICAgICAgXHRkaXZzLmVudGVyKCkuYXBwZW5kKCdkaXYnKTtcblxuICAgICAgXHRkaXZzLmV4aXQoKS5yZW1vdmUoKTtcblxuICAgICAgICBkaXZzLm9yZGVyKCk7XG4gICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICBcdGRpdnMuaHRtbChmdW5jdGlvbihkLGluZGV4KXtcbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICBcdFx0cmV0dXJuICc8ZGl2IGNsYXNzPVwibGluZU9uZVwiPjxzcGFuIGNsYXNzPVwiaW5kZXhcIj4nK1xuICAgICAgICAgICAgY291bnQrJy4gJiN4MjViMjs8L3NwYW4+IDxhIGhyZWY9JytkLnVybCsnIGNsYXNzPVwiYXJ0aWNsZVRpdGxlXCI+JytkLnRpdGxlKyc8L2E+JytcbiAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImFydGljbGVVcmxcIj4nK2Zvcm1hdFVybChkLnVybCkrJzwvc3Bhbj48L2Rpdj4nfSlcblxuICAgICAgXHRkaXZzLmFwcGVuZCgnZGl2JylcbiAgICAgIFx0XHQuYXR0cignY2xhc3MnLCAnbGluZVR3bycpXG4gICAgICBcdFx0Lmh0bWwoZnVuY3Rpb24oZCl7XG4gICAgICBcdFx0XHRyZXR1cm4gJzxzcGFuPicrZC5zY29yZSsnIHBvaW50cyBieSA8YSBocmVmPWh0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vdXNlcj9pZD0nK1xuICAgICAgICAgICAgICAgIGQuYnkrJz4nK2QuYnkrJzwvYT4nK1xuICAgICAgICAgICAgICAgICc8YSBocmVmPWh0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vaXRlbT9pZD0nK2QuaWQrJz4nK2dldE1pbnV0ZXMoZC50aW1lKSsnPC9hPiB8ICcrXG4gICAgICAgICAgICAgICAgJzxhIGhyZWY9aHR0cHM6Ly9uZXdzLnljb21iaW5hdG9yLmNvbS9pdGVtP2lkPScrZC5pZCsnPicrZm9ybWF0Q29tbWVudHMoZC5kZXNjZW5kYW50cykrJzwvc3Bhbj4nfSlcbiAgICB9XG5cbiAgICByZWYuY2hpbGQoJ3RvcHN0b3JpZXMnKS5vbigndmFsdWUnLCBmdW5jdGlvbihzbmFwc2hvdCl7XG4gICAgICAgIHZhciBpZEFycmF5ID0gc25hcHNob3QudmFsKCkuc2xpY2UoMCxudW1TdG9yaWVzKTtcbiAgICAgICAgaGFja2VybmV3c0ZhY3RvcnkuZ2V0SE5TdG9yaWVzKGlkQXJyYXksdXJsKS50aGVuKGZ1bmN0aW9uKHRvcFN0b3JpZXMpe1xuICAgICAgICAgICAgY29uc29sZS5sb2codG9wU3Rvcmllcyk7XG4gICAgICAgICAgICB1cGRhdGUodG9wU3RvcmllcylcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3RvcE5ld3MnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy90b3BOZXdzL3RvcE5ld3MuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICd0b3BOZXdzQ3RybCdcbiAgICB9KTtcbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==