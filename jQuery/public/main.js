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

    hackernewsFactory.setHNnewStoriesAPIListener().then(function(itemArray){
        update(itemArray)
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
app.controller('topNewsCtrl', function($scope,hackernewsFactory) {

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

    hackernewsFactory.setHNtopStoriesAPIListener().then(function(itemArray){
        update(itemArray)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIm5hdmJhci9uYXZiYXIuZGlyZWN0aXZlLmpzIiwibmV3ZXN0L25ld2VzdC5jb250cm9sbGVyLmpzIiwibmV3ZXN0L25ld2VzdC5zdGF0ZS5qcyIsInNlcnZpY2UvaGFja2VybmV3c0ZhY3RvcnkuanMiLCJ0b3BOZXdzL3RvcE5ld3MuY29udHJvbGxlci5qcyIsInRvcE5ld3MvdG9wTmV3cy5zdGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2hhY2tlcm5ld3MnLCBbJ3VpLnJvdXRlciddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcblxuYXBwLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlKSB7XG4gICRyb290U2NvcGUuJG9uKFwiJHN0YXRlQ2hhbmdlRXJyb3JcIiwgY29uc29sZS5sb2cuYmluZChjb25zb2xlKSk7XG59KTtcbiIsImFwcC5kaXJlY3RpdmUoXCJuYXZiYXJcIiwgZnVuY3Rpb24oKXtcblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogXCJFXCIsXG5cdFx0dGVtcGxhdGVVcmw6IFwiL25hdmJhci9uYXZiYXIuaHRtbFwiXG5cdH07XG59KTsiLCJhcHAuY29udHJvbGxlcignbmV3ZXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgaGFja2VybmV3c0ZhY3RvcnkpIHtcbiAgXG4gICAgdmFyIGNvbW1lbnRMaW5rID0gJ2h0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vaXRlbT9pZD0nO1xuXG4gICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uKGl0ZW1BcnJheSl7XG4gICAgICAgIHZhciBjb250YWluZXJEaXYgPSAkKCdkaXYubmV3U3RvcmllcycpO1xuICAgICAgICBpZiAoIWNvbnRhaW5lckRpdi5jaGlsZHJlbigpLmxlbmd0aCl7XG4gICAgICAgIC8vdXBkYXRlIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAgICAgJC5lYWNoKGl0ZW1BcnJheSwgZnVuY3Rpb24oaW5kZXgsIGl0ZW0pe1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpdk9uZSA9ICQoJzxkaXY+JylcbiAgICAgICAgICAgICAgICAgICAgLmFkZENsYXNzKCdsaW5lT25lICcraXRlbS5pZClcbiAgICAgICAgICAgICAgICAgICAgLmh0bWwoJzxkaXY+PHNwYW4gY2xhc3M9XCJpbmRleFwiPicrKGluZGV4KzEpKycuICYjeDI1YjI7PC9zcGFuPiA8YSBocmVmPScraXRlbS51cmwrXG4gICAgICAgICAgICAgICAgICAgICAgICAnIGNsYXNzPVwiYXJ0aWNsZVRpdGxlXCI+JytpdGVtLnRpdGxlKyc8L2E+JytcbiAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cImFydGljbGVVcmxcIj4nK2Zvcm1hdFVybChpdGVtLnVybCkrJzwvc3Bhbj48L2Rpdj4nKTtcblxuICAgICAgICAgICAgICAgIHZhciBkaXZUd28gPSAkKCc8ZGl2PicpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnbGluZVR3bycpXG4gICAgICAgICAgICAgICAgICAgIC5odG1sKCc8c3BhbiBjbGFzcz1cInNjb3JlXCI+JytcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uc2NvcmUrXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9zcGFuPjxzcGFuPiBwb2ludHMgYnkgPGEgaHJlZj1odHRwczovL25ld3MueWNvbWJpbmF0b3IuY29tL3VzZXI/aWQ9JytcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uYnkrJz4nK2l0ZW0uYnkrJzwvYT4gJytcbiAgICAgICAgICAgICAgICAgICAgICAgICc8YSBjbGFzcz1cIm1pbnV0ZXNcIiBocmVmPVwiJytjb21tZW50TGluaytpdGVtLmlkKydcIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArZ2V0TWludXRlcyhpdGVtLnRpbWUpKyc8L2E+JytcbiAgICAgICAgICAgICAgICAgICAgICAgICd8IDxhIGNsYXNzPVwiY29tbWVudHNcIiBocmVmPVwiJytjb21tZW50TGluaytpdGVtLmlkKydcIj4nK1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0Q29tbWVudHMoaXRlbS5kZXNjZW5kYW50cykrJzwvYT48L3NwYW4+JylcbiAgICAgICAgICAgICAgICAgICAgLmFwcGVuZFRvKGRpdk9uZSk7XG5cbiAgICAgICAgICAgICAgICBkaXZPbmUuYXBwZW5kVG8oY29udGFpbmVyRGl2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAkLmVhY2goaXRlbUFycmF5LCBmdW5jdGlvbihpbmRleCwgaXRlbSl7XG4gICAgICAgICAgICAgICAgdmFyIGRvbUl0ZW1JZCA9ICskKCdkaXYubGluZU9uZTplcSgnK2luZGV4KycpJykuYXR0cignY2xhc3MnKS5zcGxpdCgnICcpLnNsaWNlKDEpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uaWQgPT09IGRvbUl0ZW1JZCl7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBuZXcgdmFsdWVzIGZvciBzY29yZSwgdGltZSwgYW5kIGNvbW1lbnRzXG4gICAgICAgICAgICAgICAgICAgICQoJy4nK2RvbUl0ZW1JZCkuY2hpbGRyZW4oJy5saW5lVHdvJykuY2hpbGRyZW4oJy5zY29yZScpLnRleHQoaXRlbS5zY29yZSk7XG4gICAgICAgICAgICAgICAgICAgICQoJy4nK2RvbUl0ZW1JZCkuY2hpbGRyZW4oJy5saW5lVHdvJykuY2hpbGRyZW4oJy5taW51dGVzJykudGV4dChnZXRNaW51dGVzKGl0ZW0udGltZSkpO1xuICAgICAgICAgICAgICAgICAgICAkKCcuJytkb21JdGVtSWQpLmNoaWxkcmVuKCcubGluZVR3bycpLmNoaWxkcmVuKCcuY29tbWVudHMnKS50ZXh0KGZvcm1hdENvbW1lbnRzKGl0ZW0uZGVzY2VuZGFudHMpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIHN0b3JpZXMgdGhhdCBoYXZlIGNoYW5nZWQgcmFua2luZ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGhhY2tlcm5ld3NGYWN0b3J5LnNldEhObmV3U3Rvcmllc0FQSUxpc3RlbmVyKCkudGhlbihmdW5jdGlvbihpdGVtQXJyYXkpe1xuICAgICAgICB1cGRhdGUoaXRlbUFycmF5KVxuICAgIH0pO1xuXG4gICAgLy8gSGVscGVyIEZ1bmN0aW9uc1xuICAgIGZ1bmN0aW9uIGdldE1pbnV0ZXModGltZSl7XG4gICAgICAgIHZhciByZXN1bHQgPSBNYXRoLmZsb29yKChEYXRlLm5vdygpLSh0aW1lKjEwMDApKS82MDAwMCk7XG4gICAgICAgIHJldHVybiByZXN1bHQgPCA2MCA/IHJlc3VsdCsnIG1pbnV0ZXMgYWdvJyA6IE1hdGguZmxvb3IocmVzdWx0LzYwKStcbiAgICAgICAgICAgIChNYXRoLmZsb29yKHJlc3VsdC82MCkgPT09IDEgPyAnIGhvdXIgYWdvJyA6ICcgaG91cnMgYWdvJyk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGZvcm1hdENvbW1lbnRzKG51bUNvbW1lbnRzKXtcbiAgICAgICAgcmV0dXJuICFudW1Db21tZW50cyA/ICdubyBjb21tZW50cycgOiAoXG4gICAgICAgICAgICBudW1Db21tZW50cyA9PT0gMSA/IG51bUNvbW1lbnRzKycgY29tbWVudCcgOiBudW1Db21tZW50cysnIGNvbW1lbnRzJ1xuICAgICAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZm9ybWF0VXJsKHVybCl7XG4gICAgICAgIGlmICh1cmwgPT09IFwiXCIgfHwgdXJsID09PSB1bmRlZmluZWQpe3JldHVybiBcIlwifVxuICAgICAgICB2YXIgcmVzdWx0ID0gdXJsLnJlcGxhY2UoLy4qPzpcXC9cXC8vZywgXCJcIik7XG4gICAgICAgIGlmIChyZXN1bHQuaW5kZXhPZignd3d3LicpID09PSAwKSB7cmVzdWx0ID0gcmVzdWx0LnNsaWNlKDQscmVzdWx0Lmxlbmd0aCl9XG4gICAgICAgICAgICByZXR1cm4gJygnK3Jlc3VsdC5zbGljZSgwLHJlc3VsdC5pbmRleE9mKCcvJykpKycpJztcbiAgICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCduZXdlc3QnLCB7XG4gICAgICAgIHVybDogJy9uZXdlc3QnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9uZXdlc3QvbmV3ZXN0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnbmV3ZXN0Q3RybCdcbiAgICB9KTtcbn0pOyIsImFwcC5mYWN0b3J5KCdoYWNrZXJuZXdzRmFjdG9yeScsIGZ1bmN0aW9uKCRxKXtcblx0dmFyIGZhY3RvcnkgPSB7fTtcblx0dmFyIHJlZiA9IG5ldyBGaXJlYmFzZShcImh0dHBzOi8vaGFja2VyLW5ld3MuZmlyZWJhc2Vpby5jb20vdjAvXCIpO1xuXHR2YXIgaXRlbVJlZjtcblx0dmFyIG51bVN0b3JpZXMgPSAzMDtcblx0dmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblx0dmFyIGRlZmVycmVkMiA9ICRxLmRlZmVyKCk7XG5cblx0ZmFjdG9yeS5zZXRITnRvcFN0b3JpZXNBUElMaXN0ZW5lciA9IGZ1bmN0aW9uKCl7XG5cblx0XHRyZWYuY2hpbGQoJ3RvcHN0b3JpZXMnKS5vbigndmFsdWUnLCBmdW5jdGlvbihzbmFwc2hvdCl7XG5cdFx0XHR2YXIgaWRBcnJheSA9IHNuYXBzaG90LnZhbCgpLnNsaWNlKDAsbnVtU3Rvcmllcyk7XG5cdFx0XHR2YXIgaXRlbUFycmF5ID0gW11cblx0XHRcdGlkQXJyYXkuZm9yRWFjaChmdW5jdGlvbihpZCl7XG5cdFx0XHRcdHJlZi5jaGlsZCgnaXRlbS8nK2lkKS5vbmNlKCd2YWx1ZScsIGZ1bmN0aW9uKHNuYXApe1xuXHRcdFx0XHRcdGl0ZW1BcnJheS5wdXNoKHNuYXAudmFsKCkpXG5cdFx0XHRcdFx0aWYgKGl0ZW1BcnJheS5sZW5ndGggPj0gaWRBcnJheS5sZW5ndGgpe1xuXHRcdFx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShpdGVtQXJyYXkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9KVxuXG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG5cdH1cblxuXHRmYWN0b3J5LnNldEhObmV3U3Rvcmllc0FQSUxpc3RlbmVyID0gZnVuY3Rpb24oKXtcblxuXHRcdHJlZi5jaGlsZCgnbmV3c3RvcmllcycpLm9uKCd2YWx1ZScsIGZ1bmN0aW9uKHNuYXBzaG90KXtcblx0XHRcdHZhciBpZEFycmF5ID0gc25hcHNob3QudmFsKCkuc2xpY2UoMCxudW1TdG9yaWVzKTtcblx0XHRcdHZhciBpdGVtQXJyYXkgPSBbXVxuXHRcdFx0aWRBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcblx0XHRcdFx0cmVmLmNoaWxkKCdpdGVtLycraWQpLm9uY2UoJ3ZhbHVlJywgZnVuY3Rpb24oc25hcCl7XG5cdFx0XHRcdFx0aXRlbUFycmF5LnB1c2goc25hcC52YWwoKSlcblx0XHRcdFx0XHRpZiAoaXRlbUFycmF5Lmxlbmd0aCA+PSBpZEFycmF5Lmxlbmd0aCl7XG5cdFx0XHRcdFx0XHRkZWZlcnJlZDIucmVzb2x2ZShpdGVtQXJyYXkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9KVxuXG5cdFx0cmV0dXJuIGRlZmVycmVkMi5wcm9taXNlO1xuXHR9XG5cblx0cmV0dXJuIGZhY3Rvcnk7XG59KTsiLCJhcHAuY29udHJvbGxlcigndG9wTmV3c0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsaGFja2VybmV3c0ZhY3RvcnkpIHtcblxuICAgIHZhciBjb21tZW50TGluayA9ICdodHRwczovL25ld3MueWNvbWJpbmF0b3IuY29tL2l0ZW0/aWQ9JztcblxuICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbihpdGVtQXJyYXkpe1xuICAgICAgICB2YXIgY29udGFpbmVyRGl2ID0gJCgnZGl2LnRvcE5ld3MnKTtcbiAgICAgICAgaWYgKCFjb250YWluZXJEaXYuY2hpbGRyZW4oKS5sZW5ndGgpe1xuICAgICAgICAvL3VwZGF0ZSBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgICAgICQuZWFjaChpdGVtQXJyYXksIGZ1bmN0aW9uKGluZGV4LCBpdGVtKXtcblxuICAgICAgICAgICAgICAgIHZhciBkaXZPbmUgPSAkKCc8ZGl2PicpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnbGluZU9uZSAnK2l0ZW0uaWQpXG4gICAgICAgICAgICAgICAgICAgIC5odG1sKCc8ZGl2PjxzcGFuIGNsYXNzPVwiaW5kZXhcIj4nKyhpbmRleCsxKSsnLiAmI3gyNWIyOzwvc3Bhbj4gPGEgaHJlZj0nK2l0ZW0udXJsK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyBjbGFzcz1cImFydGljbGVUaXRsZVwiPicraXRlbS50aXRsZSsnPC9hPicrXG4gICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJhcnRpY2xlVXJsXCI+Jytmb3JtYXRVcmwoaXRlbS51cmwpKyc8L3NwYW4+PC9kaXY+Jyk7XG5cblxuICAgICAgICAgICAgICAgIHZhciBkaXZUd28gPSAkKCc8ZGl2PicpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnbGluZVR3bycpXG4gICAgICAgICAgICAgICAgICAgIC5odG1sKCc8c3BhbiBjbGFzcz1cInNjb3JlXCI+JytcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uc2NvcmUrXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9zcGFuPjxzcGFuPiBwb2ludHMgYnkgPGEgaHJlZj1odHRwczovL25ld3MueWNvbWJpbmF0b3IuY29tL3VzZXI/aWQ9JytcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uYnkrJz4nK2l0ZW0uYnkrJzwvYT4gJytcbiAgICAgICAgICAgICAgICAgICAgICAgICc8YSBjbGFzcz1cIm1pbnV0ZXNcIiBocmVmPVwiJytjb21tZW50TGluaytpdGVtLmlkKydcIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICArZ2V0TWludXRlcyhpdGVtLnRpbWUpKyc8L2E+JytcbiAgICAgICAgICAgICAgICAgICAgICAgICd8IDxhIGNsYXNzPVwiY29tbWVudHNcIiBocmVmPVwiJytjb21tZW50TGluaytpdGVtLmlkKydcIj4nK1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0Q29tbWVudHMoaXRlbS5kZXNjZW5kYW50cykrJzwvYT48L3NwYW4+JylcbiAgICAgICAgICAgICAgICAgICAgLmFwcGVuZFRvKGRpdk9uZSk7XG5cbiAgICAgICAgICAgICAgICBkaXZPbmUuYXBwZW5kVG8oY29udGFpbmVyRGl2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAkLmVhY2goaXRlbUFycmF5LCBmdW5jdGlvbihpbmRleCwgaXRlbSl7XG4gICAgICAgICAgICAgICAgdmFyIGRvbUl0ZW1JZCA9ICskKCdkaXYubGluZU9uZTplcSgnK2luZGV4KycpJykuYXR0cignY2xhc3MnKS5zcGxpdCgnICcpLnNsaWNlKDEpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uaWQgPT09IGRvbUl0ZW1JZCl7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBuZXcgdmFsdWVzIGZvciBzY29yZSwgdGltZSwgYW5kIGNvbW1lbnRzXG4gICAgICAgICAgICAgICAgICAgICQoJy4nK2RvbUl0ZW1JZCkuY2hpbGRyZW4oJy5saW5lVHdvJykuY2hpbGRyZW4oJy5zY29yZScpLnRleHQoaXRlbS5zY29yZSk7XG4gICAgICAgICAgICAgICAgICAgICQoJy4nK2RvbUl0ZW1JZCkuY2hpbGRyZW4oJy5saW5lVHdvJykuY2hpbGRyZW4oJy5taW51dGVzJykudGV4dChnZXRNaW51dGVzKGl0ZW0udGltZSkpO1xuICAgICAgICAgICAgICAgICAgICAkKCcuJytkb21JdGVtSWQpLmNoaWxkcmVuKCcubGluZVR3bycpLmNoaWxkcmVuKCcuY29tbWVudHMnKS50ZXh0KGZvcm1hdENvbW1lbnRzKGl0ZW0uZGVzY2VuZGFudHMpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgc3RvcmllcyB0aGF0IGhhdmUgY2hhbmdlZCByYW5raW5nXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaGFja2VybmV3c0ZhY3Rvcnkuc2V0SE50b3BTdG9yaWVzQVBJTGlzdGVuZXIoKS50aGVuKGZ1bmN0aW9uKGl0ZW1BcnJheSl7XG4gICAgICAgIHVwZGF0ZShpdGVtQXJyYXkpXG4gICAgfSk7XG5cbiAgICAvLyBIZWxwZXIgRnVuY3Rpb25zXG4gICAgZnVuY3Rpb24gZ2V0TWludXRlcyh0aW1lKXtcbiAgICAgICAgdmFyIHJlc3VsdCA9IE1hdGguZmxvb3IoKERhdGUubm93KCktKHRpbWUqMTAwMCkpLzYwMDAwKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCA8IDYwID8gcmVzdWx0KycgbWludXRlcyBhZ28nIDogTWF0aC5mbG9vcihyZXN1bHQvNjApK1xuICAgICAgICAgICAgKE1hdGguZmxvb3IocmVzdWx0LzYwKSA9PT0gMSA/ICcgaG91ciBhZ28nIDogJyBob3VycyBhZ28nKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZm9ybWF0Q29tbWVudHMobnVtQ29tbWVudHMpe1xuICAgICAgICByZXR1cm4gIW51bUNvbW1lbnRzID8gJ25vIGNvbW1lbnRzJyA6IChcbiAgICAgICAgICAgIG51bUNvbW1lbnRzID09PSAxID8gbnVtQ29tbWVudHMrJyBjb21tZW50JyA6IG51bUNvbW1lbnRzKycgY29tbWVudHMnXG4gICAgICAgICAgICApO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBmb3JtYXRVcmwodXJsKXtcbiAgICAgICAgaWYgKHVybCA9PT0gXCJcIiB8fCB1cmwgPT09IHVuZGVmaW5lZCl7cmV0dXJuIFwiXCJ9XG4gICAgICAgIHZhciByZXN1bHQgPSB1cmwucmVwbGFjZSgvLio/OlxcL1xcLy9nLCBcIlwiKTtcbiAgICAgICAgaWYgKHJlc3VsdC5pbmRleE9mKCd3d3cuJykgPT09IDApIHtyZXN1bHQgPSByZXN1bHQuc2xpY2UoNCxyZXN1bHQubGVuZ3RoKX1cbiAgICAgICAgICAgIHJldHVybiAnKCcrcmVzdWx0LnNsaWNlKDAscmVzdWx0LmluZGV4T2YoJy8nKSkrJyknO1xuICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3RvcE5ld3MnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy90b3BOZXdzL3RvcE5ld3MuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICd0b3BOZXdzQ3RybCdcbiAgICB9KTtcbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==