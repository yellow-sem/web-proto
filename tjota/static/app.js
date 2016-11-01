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

        $scope.logout = {
            submit: function () {
                currentSession = localStoreOps.getSession();
                
                backend.logout(
                    currentSession, // The session ID needs to be provided upon logout to remove the session from the system.
                    function (response) {
                        // Simply log the response.
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
                        console.log(response);
                        
                        status = response.session[0];

                      if (loginInfo.length == 1) { // If login was through an old saved sessionID
                        $scope.user.name = localStoreOps.getUsername();
                        $scope.user.provider = localStoreOps.getProvider();
                      } else { // If login was through GUL credentials
                        userdata = loginInfo[0].split("@");
                        $scope.user.name = userdata[0];
                        $scope.user.provider = userdata[1];
                        
                        localStoreOps.setSession(response.session[0]);
                        localStoreOps.setUsername(userdata[0]);
                        localStoreOps.setProvider(userdata[1]);
                      }
                      
                      $scope.login.hide();
                      $scope.$apply();
                    },
	          function (err) {
		    console.log(err);
	          });
            }
        };
                   
        $scope.chat = {
            insertChat: false,
            data: {
                chatrooms: [],
                newChat: null
            },
            getChatRooms: function () {
                apps.chat.getchatrooms(
                    $scope.user,
                    function (data) {
                        if (data.success) {
                            $scope.chat.data.chatrooms = data.chatrooms;
                        }
                        $scope.$apply();
                    }
                );
            },
            addChat: function () {
                if ($scope.chat.data.newChat != null) {
                    apps.chat.addchat(
                        $scope.user,
                        $scope.chat.data.newChat,
                        function (data) {
                            if (data.success) {
                                $scope.chat.data.chatrooms.push(data.chatroom);
                                $scope.chat.hide();
                            }
                            $scope.$apply();
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
                $scope.chat.insertChat = true;
                $scope.chat.reset();
            },
            hide: function () {
                $scope.chat.insertChat = false;
                $scope.chat.reset();
            },
            reset: function () {
                $scope.chat.data.newChat = null;
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
