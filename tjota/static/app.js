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
    
    /* Triggers when scrolled! Add limiters. */
    app.directive("directiveWhenScrolled", function() {
        return function(scope, element, attributes) {
            var raw = element[0];
            
            element.bind('scroll', function () {
                if (raw.scrollTop == 0) {
                    scope.$apply(attributes.directiveWhenScrolled);
                }
            })
        };
    });

    app.controller('main', function ($scope, apps) {

        /* ########################################
           REGISTER FUNCTIONS WITH BACKEND LIBRARY
           ######################################## */
        
        backend.onRoomChange = function (resp) {
            $scope.chat.chatrooms.push({roomid: resp.args[0],
                                       roomname: resp.args[1],
                                       roomtype: resp.args[2]});
            console.log(resp);
            $scope.$apply();
        };
        
        /* ########################################
           REGISTER FUNCTIONS WITH BACKEND LIBRARY
           ######################################## */
        
        $scope.user = {
            name: null,
            status: null,
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
            /* Function for restoring a session when user has not closed their web browser, session info
            is then still stored in window.localStorage. */
            restoreSession: function () {
                // Retreive the old session.
                existingSession = localStoreOps.getSession();
                
                // If it exists... then
                if (existingSession != null) {
                    loginInfo = [existingSession];  // Assign information to send to backend.
                    // Backend function takes: [credentials]_success_failure
                    backend.loginWithSession(
                        loginInfo,
                        function (response) {   // Success
                            console.log("Successfully restored session!");
                        },
                        function (err) {        // Failure
                            console.log(err);
                        }
                    );
                }
            },
            /* Login function that sends a request to the backend with either an existing session as a credential or
            username@provider + password. */
            submit: function () {
                // Prepares to send backend login function information, based on if a session already exists.
                loginInfo = [];
                existingSession = localStoreOps.getSession();
                
                if (existingSession == null) {
                    loginInfo = [$scope.login.data.username, $scope.login.data.password];
                } else {
                    loginInfo = [existingSession];
                }
                
                // Backend function takes: [credentials]_success_failure
                backend.loginWithCredential(
                    loginInfo,
                    /* Respose is a dictionary with a session item. Session is an array with the first item being the returned
                     session ID to be used for *this* session. The session should be saved in localstorage so it can be used to
                     easily log back in if the browser has not been closed. */
                    function (response) {       // Success
                        console.log("Login response:" + response);

                        session = response.args[0];

                        // If login was through an old saved sessionID
                        if (loginInfo.length == 1) { 
                            // Assign user data through window.localStorage.
                            $scope.user.name = localStoreOps.getUsername();
                            $scope.user.provider = localStoreOps.getProvider();
                        // If login was through GUL credentials
                        } else {                
                            // Assign user data through what was provided.
                            userdata = loginInfo[0].split("@");
                            $scope.user.name = userdata[0];
                            $scope.user.provider = userdata[1];

                            /* Store information to be able to resume session without providing credentials again. */
                            localStoreOps.setSession(session);
                            localStoreOps.setUsername(userdata[0]);
                            localStoreOps.setProvider(userdata[1]);
                        }
                        $scope.user.status = "Just logged in";  // Set status of user.
                        $scope.chat.listRooms();                // Get all chat rooms of user.  

                        $scope.login.hide();    // Hide login field.
                        $scope.$apply();        // Apply all changes.
                    },
                    function (err) {            // Failure
                        console.log(err);
                    }
                );
            }
        };
                   
        /**
        CHAT COMMANDS
        */
        
        $scope.chat = {
            chatrooms: [],                  // All currently available chat rooms.
            
            data: {
                insertChat: false,          // Set to true when you want to create a chat.
                chatName: null,             // Name of chat to be created.
                chatType: false             // Type of chat to be created.
            },
            
            /* Creates a chat room. */
            createRoom: function () {
                if ($scope.chat.data.chatName != null) {    // If input chat room name is null, don't create.
                    
                    /* The chat room type needs to be checked when adding. */
                    roomType = null;
                    if ($scope.chat.data.chatType) {    // ChatType is a boolean bound to a checkbox.
                        roomType = "public";
                    } else {
                        roomType = "private";
                    }
                    /* Backend function takes: name_type_success_failure */
                    backend.createRoom(
                        $scope.chat.data.chatName,
                        roomType,
                        function (response) {   // Success
                            console.log(response);
                        },
                        function (err) {        // Failure
                            console.log(err);
                        }
                    );
                    $scope.chat.hide();
                    $scope.chat.reset();
                }
            },
            
            /* IN PROGRESS */
            leaveRoom: function (room) {
                index = $scope.chat.chatrooms.indexOf(room);
                firsthalf = $scope.chat.chatrooms.slice(0, index);
                secondhalf = $scope.chat.chatrooms.slice(index + 1, $scope.chat.chatrooms.length);
                
                $scope.chat.chatrooms = firsthalf.concat(secondhalf);
                
                credentials = localStoreOps.getUsername() + "@" + localStoreOps.getProvider();
                // roomid, userid, credentials, success, failure
                backend.leaveRoom(
                    room.roomid,
                    localStoreOps.getSession(),
                    credentials,
                    function (response) {
                        console.log(response);
                    },
                    function (err) {
                        console.log(err);
                    }
                );
                
                //$scope.$apply();
            },
            
            /* Lists all chat rooms. */
            listRooms: function () {
                $scope.chat.chatrooms = []; 
                /* Backend function takes: success_failure */
                backend.listRooms(
                    function (response) {   // Success
                        console.log(response);
                    },
                    function (err) {        // Failure
                        console.log(err);
                    }
                );
            },
            
            // Var. for the currently active chatroom.
            activeChatroom: null,
            // Function for what happens when a chatroom is clicked. Takes the chatroom clicked as param.
            selectChatroom: function (chatroom) {
                // Set the active chat to
                $scope.chat.activeChatroom = chatroom;
                console.log("Active Chatroom: " + chatroom.roomname);
                
                // Get all members of the selected chat.
                $scope.chat.listRoomMembers(chatroom.roomid);
            },
            
            // List of all members of currently selected chatroom, see Var. activeChatroom.
            chatroomMembers: ["Adam", "Eve", "God", "The Snake", "Satan"],
            /* List members by sending list:rooms with the room-ID! */
            listRoomMembers: function (roomID) {
                // Send backend call and listen for members sent as response.
                backend.listRoomMembers(
                    roomID,
                    function (response) {
                        console.log(response);
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            },
            
            // Messages in the currently selected chat, see Var. activeChatroom.
            messages: [{date: 161102,       
                        user: "Username", 
                        content: "Hello"}, 
                       {date: 161101,
                        user: "Username",
                        content: "Hi"},
                       {date: 161031,
                        user: "Username",
                        content: "Bye"},
                       {date:161030,
                        user: "Username",
                        content: "Goodbye"}],
            
            // Limit of messages shown in the current chat room.
            messageLimit: 10,
            // When scrolled up to top limit, allow more messages to be shown.
            loadMoreMessages: function () {
                $scope.chat.messageLimit += 10;
            },
            
            // Content of a message to send.
            messageContent: "",
            // Send message and reset the message content to nothing.
            sendMessage: function () {
                console.log($scope.chat.messageContent);
                
                $scope.chat.messageContent = "";
            },
            
            /* Bullshit UI functions */
            
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
            editable: false,    // Set var to true if you want to change the status.
            
            /* Set Editable to true in order to be able to edit statuses of users.
            Opens up an input field for text, bound to user.status. */
            edit: function () {
                $scope.status.editable = true;
            },
            /* Sets editable back to false to hide input field. */
            save: function () {
                $scope.status.editable = false;
            },
        };
        
        
    });

})(TJOTA);
