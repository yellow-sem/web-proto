window.backend = (function () {
  
  var exports = {};

  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

/********************************
* Client API Object
* This is the client to the server backend. 
* Sends requests and receives messages.
*********************************/  

  var Client = function() {
    this.socket = new WebSocket('ws://' + location.host + '/backend');
    this.connected = false;
    this.socket.onopen = this.onopen.bind(this);
    this.socket.onmessage = this.onmessage.bind(this);

    // Object with callbacks
    this.callbacks = {};

    // Servers responses mapped to function
    this.responseRoutes = {     
      "room:*": this.onRoomMemberChange.bind(this), // Members in/out
      "room:self" : this.onRoomChange.bind(this), // new room / removed
      "msg:recv" : this.onMessageReceived.bind(this), // When the user gets a message
    }; 
  }

  Client.prototype.formatResponse = function (resp) {
    var formatted = {
      "command":  "",
      "id": "",
      "args": []
    };
    // Regex for a response
    var data = resp.match(/('(.+?)'|[A-Za-z0-9\w\:\-\*<<\@]+)/g);
    formatted["command"] = data[0];
    formatted["id"] = data[1];
    var argsData = data.splice(2, data.length);
    for (var key in argsData) {
      // split on ' to ensure that escaped strings get joined to normal space seperated strings.
      formatted["args"].push(argsData[key].split("'").join(""));
    }
    return formatted
  }

  Client.prototype.onRoomMemberChange = function (resp) {
    console.log("Room Members changed: ");
    console.log(resp);
  }

  Client.prototype.onRoomChange = function (resp) {
    console.log("Rooom changed: ");
    console.log(resp);
  }

  Client.prototype.onMessageReceived = function (message) {

  }

  Client.prototype.onmessage = function (event) {
    var response = this.formatResponse(event.data);
    if (response.id in this.callbacks) {
      this.callbacks[response.id](response);
      delete this.callbacks[response.id];
    } else {
      if (response.command in this.responseRoutes) {
        this.responseRoutes[response.command](response);
      } else {
        console.log("Event data: " + event.data);
        console.log("Response had no callback function: " + response);
      }
    }
  }

  Client.prototype.onopen = function () {
    this.connected = true;
  }

  Client.prototype.formatRequest = function(Args) {
    return Array.prototype.concat.apply([], Args).join(" ");
  }

  Client.prototype.send = function (Command, Id, Args) {
    console.log("Sending request: " + this.formatRequest([Command, Id, Args]));
    this.socket.send(this.formatRequest([Command, Id, Args]));
  }

  Client.prototype.registerCallback = function (Function) {
    var id = guid();
    this.callbacks[id] = Function;
    return id;
  }

  Client.prototype = Object.create(Client.prototype);
  Client.prototype.constructor = Client;

  var client = new Client();


  // Login can be both [Credential, Password] or [SessionId]
  function login (login, callback) {
    var id = client.registerCallback(function (data) {
      if (data.command == "auth:login") {
        callback({session: data.args});
      }
    });
    client.send("auth:login", id, login);
  };

  function logout (session, callback) {
    var id = client.registerCallback(function (data) {
      if (data.command == "auth:logout") {
        callback({session: false});
      }
    });
    client.send("auth:logout", id, [session]);
  }

  function check (callback) {
    
  }

  function listRooms(callback) {
    
  }

  function discoverRooms(callback) {
    
  }

  function createRoom(name, type, callback) {
    var id = client.registerCallback(function (data) {
      if (data.command == "room:create") {
        if (data.args == 'err') {
          console.log("Error on room creation");
        } else {
          callback({room: data});
        }
      }
    });
    client.send("room:create", id, ["'" + name + "'", type]);
  }

  // [roomid] << [userid] [usercredentials]
  function joinRoom(roomid, userid, credentials, callback) {
    var id = client.registerCallback(function (data) {
      if (data.command == "room:join") {
        callback({room: data});
      }
    });
    client.send("room:join", id, [roomid, "<<", userid, credentials]);
  }

  function inviteToRoom(callback) {

  }

  // [roomid] >> [userid] [usercredentials]
  function leaveRoom(roomid, userid, credentials, callback) {
    var id = client.registerCallback(function (data) {
      if (data.command == "room:leave") {
        callback({room: data});
      }
    });
    client.send("room:leave", id, [roomid, ">>", userid, credentials]);
  }

  function sendMessageTo(to, from, callback) {

  }

  function receiveMessageFrom(from, to, callback) {
    
  }

  function requestMessage(from, to, callback) {

  }

  window.setTimeout(function() {
    login(["guscrocph@yellow", "gav3_SYV"], function(resp) {
      createRoom("Philips Cool Room", "public", function (room) {
        console.log(room);
      });
    });
  }, 3000);


  exports.login = login;
  exports.logout = logout;
  exports.onRoomChange = client.onRoomChange;
  exports.onRoomMemberChange = client.onRoomMemberChange;
  
  return exports;
  
})();

