app.config(function ($stateProvider) {
    $stateProvider.state('topNews', {
        url: '/',
        templateUrl: '/topNews/topNews.html',
        controller: 'topNewsCtrl'
    });
});