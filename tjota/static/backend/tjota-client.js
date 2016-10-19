(function () {
  
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
* Sends requests and recivies messages.
*********************************/  


  var Client = function() {
    this.socket = new WebSocket('ws://' + location.host + '/backend');
    this.connected = false;
    this.socket.onopen = this.onopen.bind(this);
    this.socket.onmessage = this.onmessage.bind(this);

    // Object with callbacks
    this.callbacks = {};

    // Servers responses mapped to function
    this.responseRoute = {     
      "room:*": this.onRoomMemberChange.bind(this), // Members in/out
      "room:self" : this.onRoomChange.bind(this), // new room / removed
    }; 
    // << is join room
    // >> is leave room
    // This is not accurate, fix
    this.protocol = {
      "0" : "command",
      "1" : "id",
      "2" : "args"
    };
  }

  Client.prototype.formatResponse = function (resp) {
    var formatted = {};
    var data = resp.split(" ");
    for (var string in data) {
      if (string in this.protocol) {
        formatted[this.protocol[string]] = data[parseInt(string)];
      }
    }
    return formatted
  }

  Client.prototype.onRoomMemberChange = function (event) {
    
  }

  Client.prototype.onRoomChange = function (event) {
    
  }

  Client.prototype.onmessage = function (event) {
    var response = this.formatResponse(event.data);
    if (response.id in this.callbacks) {
      this.callbacks[response.id](response);
      delete this.callbacks[response.id];
    } else {
      console.log("Event data: " + event.data);
      console.log("Response had no callback function: " + response);
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
    
  }

  function inviteToRoom(callback) {

  }

  // [roomid] >> [userid] [usercredentials]
  function leaveRoom(callback) {
    
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
  
  return exports;
  
})();

