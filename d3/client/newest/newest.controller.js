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