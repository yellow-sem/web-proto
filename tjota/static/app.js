(function (remote) {

    remote.register(function (xhr) {
        xhr.setRequestHeader('X-CSRFToken', adjax.utils.cookie('csrftoken'));
    });

    var app = angular.module('app', []);

    /* 
     * In order to use static references to pictures in index.html we had to change the ng-expressions
     * to be called using "[[ scriptside variable or expression ]]" instead of 
     * "{{ scriptside variable or expression }}".
     */
    app.config(function ($interpolateProvider) {
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    });
    
    app.factory('apps', function () {
        return remote.apps;
    });

    app.controller('main', function ($scope, apps) {

        $scope.user = null;
        $scope.token = null;

        $scope.logout = {
            submit: function () {
                $scope.user = null;
                $scope.token = null;
            }
        };

        $scope.login = {
            visible: false,
            show: function () {
                $scope.login.visible = true;
                $scope.login.reset();
            },
            hide: function () {
                $scope.login.visible = false;
                $scope.login.reset();
            },
            data: {
                username: null,
                password: null,
                consent: false
            },
            reset: function () {
                $scope.login.data.username = null;
                $scope.login.data.password = null;
            },
            submit: function (data) {
                apps.chat.login(
                    data.username,
                    data.password,
                    function (data) {
                        if (data.success) {
                            $scope.user = data.user;
                            $scope.token = data.token;
                            
                            $scope.login.hide();
                        } else {
                            $scope.user = null;
                            $scope.token = null;
                        }

                        $scope.$apply();
                    }
                );
            }
        };
        
        $scope.chat = {
            visible: false,
            mode: false,
            data: {
                chatrooms: [],
                newChat: null
            },
            getChatRooms: function () {
                apps.chat.getchatrooms(
                    $scope.user,
                    function (data) {
                        $scope.chat.data.chatrooms = data;
                        $scope.$apply();
                    }
                );
            },
            addChat: function () {
                apps.chat.addchat(
                    $scope.user,
                    $scope.chat.data.newChat,
                    function (data) {
                        if (data.success) {
                            $scope.chat.data.chatrooms.push(data.room);
                            $scope.chat.reset();
                        }
                        $scope.$apply();
                    }
                );
            },
            show: function () {
                $scope.chat.visible = true;
            },
            hide: function () {
                $scope.chat.visible = false;
            },
            reset: function () {
                $scope.chat.data.newChat = null;
                $scope.chat.hide();
            },
        };

        $scope.status = {
            editable: false,
            edit: function () {
                $scope.status.editable = true;
            },
            save: function () {
                apps.chat.status(
                    $scope.token,
                    $scope.user.status,
                    function (data) {
                        $scope.status.editable = !data.success;
                        $scope.$apply();
                    }
                );
            },
        };
    });

})(TJOTA);
