app.config(function ($stateProvider) {
    $stateProvider.state('newest', {
        url: '/newest',
        templateUrl: '/newest/newest.html',
        controller: 'newestCtrl'
    });
});