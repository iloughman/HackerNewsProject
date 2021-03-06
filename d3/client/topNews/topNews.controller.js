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