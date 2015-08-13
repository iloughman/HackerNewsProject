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
    
    var url = "https://hacker-news.firebaseio.com/v0/";
    var ref = new Firebase(url);
    var numStories = 30;
    var commentLink = 'https://news.ycombinator.com/item?id=';

    var update = function(itemArray){
        var containerDiv = $('div.newStories');
        if (!containerDiv.children().length){
        //update for the first time
            $.each(itemArray, function(index, item){

                var divOne = $('<div>')
                    .addClass('lineOne '+item.id)
                    .html('<div><span class="index">'+(index+1)+'. &#x25b2;</span> <a href='+item.url+
                        ' class="articleTitle">'+item.title+'</a>'+
                        '<span class="articleUrl">'+formatUrl(item.url)+'</span></div>');

                var divTwo = $('<div>')
                    .addClass('lineTwo')
                    .html('<span class="score">'+
                        item.score+
                        '</span><span> points by <a href=https://news.ycombinator.com/user?id='+
                        item.by+'>'+item.by+'</a> '+
                        '<a class="minutes" href="'+commentLink+item.id+'">'
                        +getMinutes(item.time)+'</a>'+
                        '| <a class="comments" href="'+commentLink+item.id+'">'+
                        formatComments(item.descendants)+'</a></span>')
                    .appendTo(divOne);

                divOne.appendTo(containerDiv);
            });
        }
        else {

            $.each(itemArray, function(index, item){
                var domItemId = +$('div.lineOne:eq('+index+')').attr('class').split(' ').slice(1).toString();
                if (item.id === domItemId){
                    // Update new values for score, time, and comments
                    $('.'+domItemId).children('.lineTwo').children('.score').text(item.score);
                    $('.'+domItemId).children('.lineTwo').children('.minutes').text(getMinutes(item.time));
                    $('.'+domItemId).children('.lineTwo').children('.comments').text(formatComments(item.descendants));
                } else {
                  // Update stories that have changed ranking
                }
            });
        }
    };

    ref.child('newstories').on('value', function(snapshot){
        var idArray = snapshot.val().slice(0,numStories);
        hackernewsFactory.getNewHNStories(idArray,url).then(function(newStories){
            update(newStories)
        });
    });

    // Helper Functions
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
app.controller('topNewsCtrl', function($scope,hackernewsFactory) {

    var url = "https://hacker-news.firebaseio.com/v0/";
    var ref = new Firebase(url);
    var numStories = 30;
    var commentLink = 'https://news.ycombinator.com/item?id=';

    var update = function(itemArray){
        var containerDiv = $('div.topNews');
        if (!containerDiv.children().length){
        //update for the first time
            $.each(itemArray, function(index, item){

                var divOne = $('<div>')
                    .addClass('lineOne '+item.id)
                    .html('<div><span class="index">'+(index+1)+'. &#x25b2;</span> <a href='+item.url+
                        ' class="articleTitle">'+item.title+'</a>'+
                        '<span class="articleUrl">'+formatUrl(item.url)+'</span></div>');


                var divTwo = $('<div>')
                    .addClass('lineTwo')
                    .html('<span class="score">'+
                        item.score+
                        '</span><span> points by <a href=https://news.ycombinator.com/user?id='+
                        item.by+'>'+item.by+'</a> '+
                        '<a class="minutes" href="'+commentLink+item.id+'">'
                        +getMinutes(item.time)+'</a>'+
                        '| <a class="comments" href="'+commentLink+item.id+'">'+
                        formatComments(item.descendants)+'</a></span>')
                    .appendTo(divOne);

                divOne.appendTo(containerDiv);
            });
        }
        else {

            $.each(itemArray, function(index, item){
                var domItemId = +$('div.lineOne:eq('+index+')').attr('class').split(' ').slice(1).toString();
                if (item.id === domItemId){
                    // Update new values for score, time, and comments
                    $('.'+domItemId).children('.lineTwo').children('.score').text(item.score);
                    $('.'+domItemId).children('.lineTwo').children('.minutes').text(getMinutes(item.time));
                    $('.'+domItemId).children('.lineTwo').children('.comments').text(formatComments(item.descendants));
                } else {
                    // Update stories that have changed ranking
                }
            });
        }
    };

    ref.child('topstories').on('value', function(snapshot){
        var idArray = snapshot.val().slice(0,numStories);
        hackernewsFactory.getHNStories(idArray,url).then(function(topStories){
            console.log(topStories);
            update(topStories)
        });
    });

    // Helper Functions
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm5hdmJhci9uYXZiYXIuZGlyZWN0aXZlLmpzIiwibmV3ZXN0L25ld2VzdC5jb250cm9sbGVyLmpzIiwibmV3ZXN0L25ld2VzdC5zdGF0ZS5qcyIsInNlcnZpY2UvaGFja2VybmV3c0ZhY3RvcnkuanMiLCJ0b3BOZXdzL3RvcE5ld3MuY29udHJvbGxlci5qcyIsInRvcE5ld3MvdG9wTmV3cy5zdGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnaGFja2VybmV3cycsIFsndWkucm91dGVyJ10pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuXG5hcHAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUpIHtcbiAgJHJvb3RTY29wZS4kb24oXCIkc3RhdGVDaGFuZ2VFcnJvclwiLCBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpKTtcbn0pO1xuIiwiYXBwLmRpcmVjdGl2ZShcIm5hdmJhclwiLCBmdW5jdGlvbigpe1xuXHRyZXR1cm4ge1xuXHRcdHJlc3RyaWN0OiBcIkVcIixcblx0XHR0ZW1wbGF0ZVVybDogXCIvbmF2YmFyL25hdmJhci5odG1sXCJcblx0fTtcbn0pOyIsImFwcC5jb250cm9sbGVyKCduZXdlc3RDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBoYWNrZXJuZXdzRmFjdG9yeSkge1xuICAgIFxuICAgIHZhciB1cmwgPSBcImh0dHBzOi8vaGFja2VyLW5ld3MuZmlyZWJhc2Vpby5jb20vdjAvXCI7XG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZSh1cmwpO1xuICAgIHZhciBudW1TdG9yaWVzID0gMzA7XG4gICAgdmFyIGNvbW1lbnRMaW5rID0gJ2h0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vaXRlbT9pZD0nO1xuXG4gICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uKGl0ZW1BcnJheSl7XG4gICAgICAgIHZhciBjb250YWluZXJEaXYgPSAkKCdkaXYubmV3U3RvcmllcycpO1xuICAgICAgICBpZiAoIWNvbnRhaW5lckRpdi5jaGlsZHJlbigpLmxlbmd0aCl7XG4gICAgICAgIC8vdXBkYXRlIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAgICAgJC5lYWNoKGl0ZW1BcnJheSwgZnVuY3Rpb24oaW5kZXgsIGl0ZW0pe1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpdk9uZSA9ICQoJzxkaXY+JylcbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdsaW5lT25lICcraXRlbS5pZClcbiAgICAgICAgICAgICAgICAgICAgLmh0bWwoJzxkaXY+PHNwYW4gY2xhc3M9XCJpbmRleFwiPicrKGluZGV4KzEpKycuICYjeDI1YjI7PC9zcGFuPiA8YSBocmVmPScraXRlbS51cmwrXG4gICAgICAgICAgICAgICAgICAgICAgICAnIGNsYXNzPVwiYXJ0aWNsZVRpdGxlXCI+JytpdGVtLnRpdGxlKyc8L2E+JytcbiAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImFydGljbGVVcmxcIj4nK2Zvcm1hdFVybChpdGVtLnVybCkrJzwvc3Bhbj48L2Rpdj4nKTtcblxuICAgICAgICAgICAgICAgIHZhciBkaXZUd28gPSAkKCc8ZGl2PicpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnbGluZVR3bycpXG4gICAgICAgICAgICAgICAgICAgIC5odG1sKCc8c3BhbiBjbGFzcz1cInNjb3JlXCI+JytcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uc2NvcmUrXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9zcGFuPjxzcGFuPiBwb2ludHMgYnkgPGEgaHJlZj1odHRwczovL25ld3MueWNvbWJpbmF0b3IuY29tL3VzZXI/aWQ9JytcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uYnkrJz4nK2l0ZW0uYnkrJzwvYT4gJytcbiAgICAgICAgICAgICAgICAgICAgICAgICc8YSBjbGFzcz1cIm1pbnV0ZXNcIiBocmVmPVwiJytjb21tZW50TGluaytpdGVtLmlkKydcIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArZ2V0TWludXRlcyhpdGVtLnRpbWUpKyc8L2E+JytcbiAgICAgICAgICAgICAgICAgICAgICAgICd8IDxhIGNsYXNzPVwiY29tbWVudHNcIiBocmVmPVwiJytjb21tZW50TGluaytpdGVtLmlkKydcIj4nK1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0Q29tbWVudHMoaXRlbS5kZXNjZW5kYW50cykrJzwvYT48L3NwYW4+JylcbiAgICAgICAgICAgICAgICAgICAgLmFwcGVuZFRvKGRpdk9uZSk7XG5cbiAgICAgICAgICAgICAgICBkaXZPbmUuYXBwZW5kVG8oY29udGFpbmVyRGl2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAkLmVhY2goaXRlbUFycmF5LCBmdW5jdGlvbihpbmRleCwgaXRlbSl7XG4gICAgICAgICAgICAgICAgdmFyIGRvbUl0ZW1JZCA9ICskKCdkaXYubGluZU9uZTplcSgnK2luZGV4KycpJykuYXR0cignY2xhc3MnKS5zcGxpdCgnICcpLnNsaWNlKDEpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uaWQgPT09IGRvbUl0ZW1JZCl7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBuZXcgdmFsdWVzIGZvciBzY29yZSwgdGltZSwgYW5kIGNvbW1lbnRzXG4gICAgICAgICAgICAgICAgICAgICQoJy4nK2RvbUl0ZW1JZCkuY2hpbGRyZW4oJy5saW5lVHdvJykuY2hpbGRyZW4oJy5zY29yZScpLnRleHQoaXRlbS5zY29yZSk7XG4gICAgICAgICAgICAgICAgICAgICQoJy4nK2RvbUl0ZW1JZCkuY2hpbGRyZW4oJy5saW5lVHdvJykuY2hpbGRyZW4oJy5taW51dGVzJykudGV4dChnZXRNaW51dGVzKGl0ZW0udGltZSkpO1xuICAgICAgICAgICAgICAgICAgICAkKCcuJytkb21JdGVtSWQpLmNoaWxkcmVuKCcubGluZVR3bycpLmNoaWxkcmVuKCcuY29tbWVudHMnKS50ZXh0KGZvcm1hdENvbW1lbnRzKGl0ZW0uZGVzY2VuZGFudHMpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIHN0b3JpZXMgdGhhdCBoYXZlIGNoYW5nZWQgcmFua2luZ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlZi5jaGlsZCgnbmV3c3RvcmllcycpLm9uKCd2YWx1ZScsIGZ1bmN0aW9uKHNuYXBzaG90KXtcbiAgICAgICAgdmFyIGlkQXJyYXkgPSBzbmFwc2hvdC52YWwoKS5zbGljZSgwLG51bVN0b3JpZXMpO1xuICAgICAgICBoYWNrZXJuZXdzRmFjdG9yeS5nZXROZXdITlN0b3JpZXMoaWRBcnJheSx1cmwpLnRoZW4oZnVuY3Rpb24obmV3U3Rvcmllcyl7XG4gICAgICAgICAgICB1cGRhdGUobmV3U3RvcmllcylcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBIZWxwZXIgRnVuY3Rpb25zXG4gICAgZnVuY3Rpb24gZ2V0TWludXRlcyh0aW1lKXtcbiAgICAgICAgdmFyIHJlc3VsdCA9IE1hdGguZmxvb3IoKERhdGUubm93KCktKHRpbWUqMTAwMCkpLzYwMDAwKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCA8IDYwID8gcmVzdWx0KycgbWludXRlcyBhZ28nIDogTWF0aC5mbG9vcihyZXN1bHQvNjApK1xuICAgICAgICAgICAgKE1hdGguZmxvb3IocmVzdWx0LzYwKSA9PT0gMSA/ICcgaG91ciBhZ28nIDogJyBob3VycyBhZ28nKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZm9ybWF0Q29tbWVudHMobnVtQ29tbWVudHMpe1xuICAgICAgICByZXR1cm4gIW51bUNvbW1lbnRzID8gJ25vIGNvbW1lbnRzJyA6IChcbiAgICAgICAgICAgIG51bUNvbW1lbnRzID09PSAxID8gbnVtQ29tbWVudHMrJyBjb21tZW50JyA6IG51bUNvbW1lbnRzKycgY29tbWVudHMnXG4gICAgICAgICAgICApO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBmb3JtYXRVcmwodXJsKXtcbiAgICAgICAgaWYgKHVybCA9PT0gXCJcIiB8fCB1cmwgPT09IHVuZGVmaW5lZCl7cmV0dXJuIFwiXCJ9XG4gICAgICAgIHZhciByZXN1bHQgPSB1cmwucmVwbGFjZSgvLio/OlxcL1xcLy9nLCBcIlwiKTtcbiAgICAgICAgaWYgKHJlc3VsdC5pbmRleE9mKCd3d3cuJykgPT09IDApIHtyZXN1bHQgPSByZXN1bHQuc2xpY2UoNCxyZXN1bHQubGVuZ3RoKX1cbiAgICAgICAgICAgIHJldHVybiAnKCcrcmVzdWx0LnNsaWNlKDAscmVzdWx0LmluZGV4T2YoJy8nKSkrJyknO1xuICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ25ld2VzdCcsIHtcbiAgICAgICAgdXJsOiAnL25ld2VzdCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL25ld2VzdC9uZXdlc3QuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICduZXdlc3RDdHJsJ1xuICAgIH0pO1xufSk7IiwiYXBwLmZhY3RvcnkoJ2hhY2tlcm5ld3NGYWN0b3J5JywgZnVuY3Rpb24oJHEpe1xuXHR2YXIgZmFjdG9yeSA9IHt9O1xuXG5cdGZhY3RvcnkuZ2V0SE5TdG9yaWVzID0gZnVuY3Rpb24oaWRBcnJheSx1cmwpe1xuXG5cdFx0dmFyIHJlZiA9IG5ldyBGaXJlYmFzZSh1cmwpO1xuXHRcdHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cdFx0dmFyIGl0ZW1BcnJheSA9IFtdXG5cblx0XHRpZEFycmF5LmZvckVhY2goZnVuY3Rpb24oaWQpe1xuXHRcdFx0cmVmLmNoaWxkKCdpdGVtLycraWQpLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcCl7XG5cdFx0XHRcdGl0ZW1BcnJheS5wdXNoKHNuYXAudmFsKCkpXG5cdFx0XHRcdGlmIChpdGVtQXJyYXkubGVuZ3RoID49IGlkQXJyYXkubGVuZ3RoKXtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhcIml0ZW1cIiwgaXRlbUFycmF5KVxuXHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmUoaXRlbUFycmF5KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0fVxuXG5cdGZhY3RvcnkuZ2V0TmV3SE5TdG9yaWVzID0gZnVuY3Rpb24oaWRBcnJheSx1cmwpe1xuXG5cdFx0dmFyIHJlZiA9IG5ldyBGaXJlYmFzZSh1cmwpO1xuXHRcdHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cdFx0dmFyIGl0ZW1BcnJheSA9IFtdXG5cblx0XHRpZEFycmF5LmZvckVhY2goZnVuY3Rpb24oaWQpe1xuXHRcdFx0cmVmLmNoaWxkKCdpdGVtLycraWQpLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcCl7XG5cdFx0XHRcdGl0ZW1BcnJheS5wdXNoKHNuYXAudmFsKCkpXG5cdFx0XHRcdGlmIChpdGVtQXJyYXkubGVuZ3RoID49IGlkQXJyYXkubGVuZ3RoKXtcblx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZyhcIml0ZW1cIiwgaXRlbUFycmF5KVxuXHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmUoaXRlbUFycmF5KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0XG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG5cdH1cblxuXHRyZXR1cm4gZmFjdG9yeTtcbn0pOyIsImFwcC5jb250cm9sbGVyKCd0b3BOZXdzQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSxoYWNrZXJuZXdzRmFjdG9yeSkge1xuXG4gICAgdmFyIHVybCA9IFwiaHR0cHM6Ly9oYWNrZXItbmV3cy5maXJlYmFzZWlvLmNvbS92MC9cIjtcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKHVybCk7XG4gICAgdmFyIG51bVN0b3JpZXMgPSAzMDtcbiAgICB2YXIgY29tbWVudExpbmsgPSAnaHR0cHM6Ly9uZXdzLnljb21iaW5hdG9yLmNvbS9pdGVtP2lkPSc7XG5cbiAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24oaXRlbUFycmF5KXtcbiAgICAgICAgdmFyIGNvbnRhaW5lckRpdiA9ICQoJ2Rpdi50b3BOZXdzJyk7XG4gICAgICAgIGlmICghY29udGFpbmVyRGl2LmNoaWxkcmVuKCkubGVuZ3RoKXtcbiAgICAgICAgLy91cGRhdGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgICAgICAkLmVhY2goaXRlbUFycmF5LCBmdW5jdGlvbihpbmRleCwgaXRlbSl7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGl2T25lID0gJCgnPGRpdj4nKVxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ2xpbmVPbmUgJytpdGVtLmlkKVxuICAgICAgICAgICAgICAgICAgICAuaHRtbCgnPGRpdj48c3BhbiBjbGFzcz1cImluZGV4XCI+JysoaW5kZXgrMSkrJy4gJiN4MjViMjs8L3NwYW4+IDxhIGhyZWY9JytpdGVtLnVybCtcbiAgICAgICAgICAgICAgICAgICAgICAgICcgY2xhc3M9XCJhcnRpY2xlVGl0bGVcIj4nK2l0ZW0udGl0bGUrJzwvYT4nK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwiYXJ0aWNsZVVybFwiPicrZm9ybWF0VXJsKGl0ZW0udXJsKSsnPC9zcGFuPjwvZGl2PicpO1xuXG5cbiAgICAgICAgICAgICAgICB2YXIgZGl2VHdvID0gJCgnPGRpdj4nKVxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ2xpbmVUd28nKVxuICAgICAgICAgICAgICAgICAgICAuaHRtbCgnPHNwYW4gY2xhc3M9XCJzY29yZVwiPicrXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnNjb3JlK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzwvc3Bhbj48c3Bhbj4gcG9pbnRzIGJ5IDxhIGhyZWY9aHR0cHM6Ly9uZXdzLnljb21iaW5hdG9yLmNvbS91c2VyP2lkPScrXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmJ5Kyc+JytpdGVtLmJ5Kyc8L2E+ICcrXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGEgY2xhc3M9XCJtaW51dGVzXCIgaHJlZj1cIicrY29tbWVudExpbmsraXRlbS5pZCsnXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgK2dldE1pbnV0ZXMoaXRlbS50aW1lKSsnPC9hPicrXG4gICAgICAgICAgICAgICAgICAgICAgICAnfCA8YSBjbGFzcz1cImNvbW1lbnRzXCIgaHJlZj1cIicrY29tbWVudExpbmsraXRlbS5pZCsnXCI+JytcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdENvbW1lbnRzKGl0ZW0uZGVzY2VuZGFudHMpKyc8L2E+PC9zcGFuPicpXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmRUbyhkaXZPbmUpO1xuXG4gICAgICAgICAgICAgICAgZGl2T25lLmFwcGVuZFRvKGNvbnRhaW5lckRpdik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgJC5lYWNoKGl0ZW1BcnJheSwgZnVuY3Rpb24oaW5kZXgsIGl0ZW0pe1xuICAgICAgICAgICAgICAgIHZhciBkb21JdGVtSWQgPSArJCgnZGl2LmxpbmVPbmU6ZXEoJytpbmRleCsnKScpLmF0dHIoJ2NsYXNzJykuc3BsaXQoJyAnKS5zbGljZSgxKS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmlkID09PSBkb21JdGVtSWQpe1xuICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgbmV3IHZhbHVlcyBmb3Igc2NvcmUsIHRpbWUsIGFuZCBjb21tZW50c1xuICAgICAgICAgICAgICAgICAgICAkKCcuJytkb21JdGVtSWQpLmNoaWxkcmVuKCcubGluZVR3bycpLmNoaWxkcmVuKCcuc2NvcmUnKS50ZXh0KGl0ZW0uc2NvcmUpO1xuICAgICAgICAgICAgICAgICAgICAkKCcuJytkb21JdGVtSWQpLmNoaWxkcmVuKCcubGluZVR3bycpLmNoaWxkcmVuKCcubWludXRlcycpLnRleHQoZ2V0TWludXRlcyhpdGVtLnRpbWUpKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnLicrZG9tSXRlbUlkKS5jaGlsZHJlbignLmxpbmVUd28nKS5jaGlsZHJlbignLmNvbW1lbnRzJykudGV4dChmb3JtYXRDb21tZW50cyhpdGVtLmRlc2NlbmRhbnRzKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIHN0b3JpZXMgdGhhdCBoYXZlIGNoYW5nZWQgcmFua2luZ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlZi5jaGlsZCgndG9wc3RvcmllcycpLm9uKCd2YWx1ZScsIGZ1bmN0aW9uKHNuYXBzaG90KXtcbiAgICAgICAgdmFyIGlkQXJyYXkgPSBzbmFwc2hvdC52YWwoKS5zbGljZSgwLG51bVN0b3JpZXMpO1xuICAgICAgICBoYWNrZXJuZXdzRmFjdG9yeS5nZXRITlN0b3JpZXMoaWRBcnJheSx1cmwpLnRoZW4oZnVuY3Rpb24odG9wU3Rvcmllcyl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0b3BTdG9yaWVzKTtcbiAgICAgICAgICAgIHVwZGF0ZSh0b3BTdG9yaWVzKVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIEhlbHBlciBGdW5jdGlvbnNcbiAgICBmdW5jdGlvbiBnZXRNaW51dGVzKHRpbWUpe1xuICAgICAgICB2YXIgcmVzdWx0ID0gTWF0aC5mbG9vcigoRGF0ZS5ub3coKS0odGltZSoxMDAwKSkvNjAwMDApO1xuICAgICAgICByZXR1cm4gcmVzdWx0IDwgNjAgPyByZXN1bHQrJyBtaW51dGVzIGFnbycgOiBNYXRoLmZsb29yKHJlc3VsdC82MCkrXG4gICAgICAgICAgICAoTWF0aC5mbG9vcihyZXN1bHQvNjApID09PSAxID8gJyBob3VyIGFnbycgOiAnIGhvdXJzIGFnbycpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBmb3JtYXRDb21tZW50cyhudW1Db21tZW50cyl7XG4gICAgICAgIHJldHVybiAhbnVtQ29tbWVudHMgPyAnbm8gY29tbWVudHMnIDogKFxuICAgICAgICAgICAgbnVtQ29tbWVudHMgPT09IDEgPyBudW1Db21tZW50cysnIGNvbW1lbnQnIDogbnVtQ29tbWVudHMrJyBjb21tZW50cydcbiAgICAgICAgICAgICk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGZvcm1hdFVybCh1cmwpe1xuICAgICAgICBpZiAodXJsID09PSBcIlwiIHx8IHVybCA9PT0gdW5kZWZpbmVkKXtyZXR1cm4gXCJcIn1cbiAgICAgICAgdmFyIHJlc3VsdCA9IHVybC5yZXBsYWNlKC8uKj86XFwvXFwvL2csIFwiXCIpO1xuICAgICAgICBpZiAocmVzdWx0LmluZGV4T2YoJ3d3dy4nKSA9PT0gMCkge3Jlc3VsdCA9IHJlc3VsdC5zbGljZSg0LHJlc3VsdC5sZW5ndGgpfVxuICAgICAgICAgICAgcmV0dXJuICcoJytyZXN1bHQuc2xpY2UoMCxyZXN1bHQuaW5kZXhPZignLycpKSsnKSc7XG4gICAgfTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndG9wTmV3cycsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL3RvcE5ld3MvdG9wTmV3cy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3RvcE5ld3NDdHJsJ1xuICAgIH0pO1xufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9