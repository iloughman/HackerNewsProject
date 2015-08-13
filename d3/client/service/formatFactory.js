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