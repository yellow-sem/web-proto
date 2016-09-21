(function (remote) {

    remote.register(function (xhr) {
        xhr.setRequestHeader('X-CSRFToken', adjax.utils.cookie('csrftoken'));
    });

    var app = angular.module('app', []);

    app.factory('apps', function () {
        return remote.apps;
    });

    app.controller('main', function ($scope, apps) {

        // Client-side functionality go here

        $scope.credentials = {
            username: null,
            password: null,
        };

        $scope.login = function () {
            remote.apps.chat.login(
                $scope.credentials.username,
                $scope.credentials.password,
                function (success) {
                    $scope.success = success;

                    $scope.$apply();
                }
            );

        };

    });

})(TJOTA);
