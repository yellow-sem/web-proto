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

        $scope.user = {
            name: null,
            provider: null
        };

        /*
        LOGOUT COMMANDS
        */
        
        $scope.logout = {
            submit: function () {
                currentSession = localStoreOps.getSession();
                
                backend.logoutFromSession(
                    currentSession, // The session ID needs to be provided upon logout to remove the session from the system.
                    function (response) {
                        // Simply log the response.
                        console.log(response);
                    },
                    function (err) {
                        console.log(response);
                    }
                );
                // Remove local variable bindings
                $scope.user.name = null;
                $scope.user.provider = null;
                
                // Remove LocalStorage variables, username, provider and session.
                localStoreOps.removeSession();
                localStoreOps.removeUsername();
                localStoreOps.removeProvider();
            }
        };

        /*
        LOGIN COMMANDS
        */
        
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
            restoreSession: function () {
                existingSession = localStoreOps.getSession();
                
                if (existingSession != null) {
                    loginInfo = [existingSession];
                    
                    backend.loginWithSession(
                        loginInfo,
                        function (response) {
                            console.log("Successfully restored session!");
                        },
                        function (err) {
                            console.log(err);
                        }
                    );
                }
            },
            submit: function () {
                // Prepares to send backend login function information, based on if a session already exists.
                loginInfo = null;
                existingSession = localStoreOps.getSession();
                
                if (existingSession == null) {
                    loginInfo = [$scope.login.data.username, $scope.login.data.password];
                } else {
                    loginInfo = [existingSession];
                }
                
                // Backend is the name of the tjota-client, the function called is named login which takes an array as input.
                backend.loginWithCredential(
                    loginInfo,
                    /* Respose is a dictionary with a session item. Session is an array with the first item being the returned
                     session ID to be used for *this* session. The session should be saved in localstorage so it can be used to
                     easily log back in if the browser has not been closed. */
                    function (response) {
                        session = response.args[0];

                        if (loginInfo.length == 1) { // If login was through an old saved sessionID
                            $scope.user.name = localStoreOps.getUsername();
                            $scope.user.provider = localStoreOps.getProvider();
                        } else { // If login was through GUL credentials
                            userdata = loginInfo[0].split("@");
                            $scope.user.name = userdata[0];
                            $scope.user.provider = userdata[1];

                            localStoreOps.setSession(session);
                            localStoreOps.setUsername(userdata[0]);
                            localStoreOps.setProvider(userdata[1]);
                        }
                      $scope.chat.listRooms();
                        
                      $scope.login.hide();
                      $scope.$apply();
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            }
        };
                   
        /**
        CHAT COMMANDS
        */
        
        $scope.chat = {
            chatrooms: [],
            data: {
                insertChat: false,
                chatName: null,
                chatType: false
            },
            listRooms: function () {
                backend.listRooms(
                    function (response) {
                        console.log(response);
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            },
            createRoom: function () {
                if ($scope.chat.data.chatName != null) {
                    
                    roomType = null;
                    if ($scope.chat.data.chatType) {
                        roomType = "public";
                    } else {
                        roomType = "private";
                    }
                    
                    backend.createRoom(
                        $scope.chat.data.chatName,
                        roomType,
                        function (response) {
                            console.log(response);
                            
                            $scope.chat.hide();
                            $scope.chat.reset();
                        },
                        function (err) {
                            console.log(err);
                        }
                    );
                }
            },
            removeChat: function (chatroom) {
                apps.chat.removechat(
                    $scope.user,
                    chatroom,
                    function (data) {
                        if (data.success) {
                            index = $scope.chat.data.chatrooms.indexOf(chatroom);
                            length = $scope.chat.data.chatrooms.length;
                            first = $scope.chat.data.chatrooms.slice(0, index);
                            second = $scope.chat.data.chatrooms.slice(index + 1, length);
                            $scope.chat.data.chatrooms = first.concat(second);
                        }
                        $scope.$apply();
                    }
                );
            },
            show: function () {
                $scope.chat.data.insertChat = true;
                $scope.chat.reset();
            },
            hide: function () {
                $scope.chat.data.insertChat = false;
                $scope.chat.reset();
            },
            reset: function () {
                $scope.chat.data.chatName = null;
                $scope.chat.data.chatType = false;
            },
        };

        /**
        STATUS COMMANDS
        */
        
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
