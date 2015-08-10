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