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