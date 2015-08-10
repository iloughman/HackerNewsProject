var Article = React.createClass({
  	render: function() {
  		var userLink = 'https://news.ycombinator.com/user?id=';
  		var articleLink = 'https://news.ycombinator.com/item?id=';
    	return (
      	<div className="article">
      		<div className="lineOne">
      			<span className="index">{this.props.index}.&#x25b2;</span>
	        	<a href={this.props.url} className="articleTitle">
	          	{this.props.title}
	          	</a>
	          	<span className="articleUrl">{formatUrl(this.props.url)}
	        	</span>
        	</div>
        	<div className="lineTwo">
        		<span>{formatPoints(this.props.score)} by 
        		<a href={userLink.concat(this.props.by)}>{this.props.by}</a>
        		 <a href={articleLink.concat(this.props.id)}>
        		 {getMinutes(this.props.time)}</a>
        		 |
        		<a href={articleLink.concat(this.props.id)}>
        		{formatComments(this.props.descendants)}</a>
        		</span>
        	</div>
      	</div>
    	);
  	}
});

var ArticleBox = React.createClass({
	getInitialState: function(){
		return {data: []}
	},
	componentWillMount: function(){
		var self = this;
		var firebaseRef = new Firebase("https://hacker-news.firebaseio.com/v0/");
		firebaseRef.child('topstories').on('value', function(snapshot){
			var idArray = snapshot.val().slice(0,30);
			var itemArray = [];
			idArray.forEach(function(id){
				firebaseRef.child('item/'+id).once('value', function(snap){
					itemArray.push(snap.val())
					if(itemArray.length >= idArray.length){
						self.setState({data:itemArray})
					}
				})
			})
		}).bind(this);
	},
	render: function(){
		var imageSrc = 'https://news.ycombinator.com/favicon.ico';
		return (
			<div className="container">
				<header><img src={imageSrc}/><div className="title">
				Hacker News</div>
				</header>
				<ArticleList data={this.state.data} />
			</div>
		);
	}
});

var ArticleList = React.createClass({
    render: function() {
    	var articleNodes = this.props.data.map(function(article, index){
    		return (
    			<Article title={article.title} 
    					index={index+1}
    					url={article.url} 
    					score={article.score}
    					by={article.by}
    					time={article.time}
    					descendants={article.descendants}
    					id = {article.id}>
    				{article.text}
    			</Article>
    		);
    	});
    	return (
    		<div className="articleList">
    			{articleNodes}
    		</div>
    	);
    }
});

React.render(
	<ArticleBox />,
	document.getElementById('content')
);

// Helper Functions

function getMinutes(time){
	var result = Math.floor((Date.now()-(time*1000))/60000);
	return result < 60 ? result+' minutes ago' : Math.floor(result/60)+
		(Math.floor(result/60) === 1 ? ' hour ago' : ' hours ago');
}

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

function formatPoints(points){
	return points > 1 ? points+' points': (
		points === 1 ? points+' point' : ''
	);
};

