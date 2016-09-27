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
            username: 'test',
            password: 'test',
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

        remote.apps.chat.get_messages(function (messages) {
            $scope.messages = messages;

            $scope.$apply();
        });

        $scope.doSomething = function () {
            alert('something');
        };

        $scope.addMessage = function () {
            $scope.messages.push({
                time: '22:22',
                content: 'hello3',
            });
        };

    });

})(TJOTA);
