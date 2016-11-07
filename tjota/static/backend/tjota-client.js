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

  function formatResponse(resp) {
     var formatted = {
      "command":  "",
      "id": "",
      "args": []
    };
    // Regex for a response
    var data = resp.match(/('(.*)'|[A-Za-z0-9\w\:\-\*<<>>\@]+)/g);
    formatted["command"] = data[0];
    formatted["id"] = data[1];
    var argsData = data.splice(2, data.length);
    for (var key in argsData) {
      var arg = argsData[key];
      if (arg.charAt(0) === "'") {
        arg = unescapeSingleQuote(arg.substring(1, arg.length - 1));
      }
      // split on ' to ensure that escaped strings get joined to normal space seperated strings.
      formatted["args"].push(arg);
    }
    return formatted
  }

  function escapeSingleQuote(str) {
    return str.replace(/'/g, "\\'");
  }

  function unescapeSingleQuote(str) {
    return str.replace(/\\\'/g, "'");
  }

/********************************
* Client API Object
* This is the client to the server backend. 
* Sends requests and receives messages.
*********************************/  

  var Client = function() {
    this.socket = new WebSocket('ws://' + location.hostname + ':8080/');
    this.connected = false;
    this.socket.onopen = this.onopen.bind(this);
    this.socket.onmessage = this.onmessage.bind(this);

    // Object with callbacks
    this.callbacks = {};

    // Servers responses mapped to function
    this.responseRoutes = {     
      "room:*" : this.onRoomMemberChange.bind(exports),
      "room:self" : this.onRoomChange.bind(exports), // new room / removed
      "msg:recv" : this.onMessageReceived.bind(exports), // When the user gets a message
      "room:exit" : this.onRoomExit.bind(exports), // When someone leaves a room.
      "status:recv" : this.onStatusReceived.bind(exports), // status notifciations
    }; 
  }

  Client.prototype.formatResponse = function (resp) {
    return formatResponse(resp);
  }

  Client.prototype.onRoomMemberChange = function (resp) {
    this.onRoomMemberChange(resp);
  }

  Client.prototype.onRoomChange = function (resp) {
    this.onRoomChange(resp);
  }

  Client.prototype.onMessageReceived = function (message) {
    this.onMessageReceived(message);
  }

  Client.prototype.onRoomExit = function (resp) {
    this.onRoomExit(resp);
  }

  Client.prototype.onStatusReceived = function (resp) {
    this.onStatusReceived(resp);
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
    if (exports.onOpen) {
      exports.onOpen(true);
    }
    this.connected = true;
    
  }

  Client.prototype.formatRequest = function(Args) {
    return Array.prototype.concat.apply([], Args).join(" ") + "\n";
  }

  Client.prototype.send = function (Command, Id, Args) {
    console.log("Sending request: " + this.formatRequest([Command, Id, Args]));
    this.socket.send(this.formatRequest([Command, Id, Args]));
  }

  Client.prototype.registerCallback = function (id, Function) {
    // Shoud never be any duplicates....
    this.callbacks[id] = Function;
  }

  Client.prototype = Object.create(Client.prototype);
  Client.prototype.constructor = Client;

  var client = new Client();

  function command(command, id, args, success, failure) {
    client.registerCallback(id, function (data) {
      if (data.args == "err") {
        failure(data);
      } else {
        success(data);
      }
    });
    client.send(command, id, args);
  }

  /****************************************
   *
   * API
   *
   ****************************************/

  // [Credential@Provider, Password]
  function loginWithCredential (credential, success, failure) {
    command("auth:login", guid(), credential, success, failure);
  }

  // [guid]
  function loginWithSession (session, success, failure) {
    command("auth:login", guid(), session, success, failure);
  }
  
  // [guid]
  function logoutFromSession (session, success, failure) {
    command("auth:logout", guid(), session, success, failure);
  }

  function check (success, failure) {
    command("auth:check", guid(), [], success, failure);
  }

  function listRooms (success, failure) {
    command("room:list", guid(), [], success, failure);
  }

  function listRoomMembers (roomid, success, failure) {
    command("room:list", guid(), [roomid], success, failure);
  }

  function discoverRooms (success, failure) {
    command("room:discover", guid(), [], success, failure);
  }

  function createRoom (name, type, success, failure) {
    command("room:create", 
            guid(),
            ["'" + escapeSingleQuote(name) + "'", type], 
            success, 
            failure);
  }

  function createRoomWithDirectOrBot (name, type, extra, success, failure) {
    command("room:create",
            guid(),
            ["'" + escapeSingleQuote(name) + "'", type, "'" + escapeSingleQuote(extra) + "'"],
            success,
            failure);
  }

  // [roomid] 
  function joinRoom (roomid, success, failure) {
    command("room:join",
            guid(),
            [roomid, "<<", userid, credentials], 
            success, 
            failure);
  }

  function inviteToRoom (credential, success, failure) {
    command("room:invite", 
            guid(),
            [credential], 
            success, 
            failure);
  }

   // [roomid] >> [userid] [usercredentials]
  function leaveRoom (roomid, userid, credentials, success, failure) {
    command("room:leave", 
            guid(),
            [roomid], 
            success, 
            failure);
  }

  function sendMessageTo (to, message, success, failure) { 
    command("msg:send", 
            guid(),
            [to, "'" + escapeSingleQuote(message) + "'"], 
            success, 
            failure);
  }

  function requestMessages (roomid, success, failure) {
    command("msg:req", guid(), [roomid], success, failure);
  }

  function setStatus(string, success, failure) {
    command("status:set", guid(), ["'" + escapeSingleQuote(string) + "'"], success, failure);
  }

  function requestStatuses(success, failure) {
    command("status:req", guid(), [], success, failure);
  }

  /**
     EXPORTS
   **/

  exports.loginWithSession = loginWithSession;
  exports.loginWithCredential = loginWithCredential;
  exports.logoutFromSession = logoutFromSession;
  exports.createRoom = createRoom;
  exports.createRoomWithDirectOrBot = createRoomWithDirectOrBot;
  exports.leaveRoom = leaveRoom;
  exports.joinRoom = joinRoom;
  exports.listRooms = listRooms;
  exports.listRoomMembers = listRoomMembers;
  exports.leaveRoom = leaveRoom;
  exports.requestMessages = requestMessages;
  exports.sendMessageTo = sendMessageTo;
  exports.setStatus = setStatus;
  exports.requestStatuses = requestStatuses;
  exports.discoverRooms = discoverRooms;

  exports.onOpen = function (c) {
    console.log("On open, callback " + c);
  }

  exports.isConnected = function () {
      return client.connected;
  };

  exports.onRoomExit = function (resp) {
    console.log("On Room exit");
    console.log(resp);
  }
  exports.onMessageReceived = function (resp) {
    console.log("On msg recv");
    console.log(resp);
  }
  exports.onRoomChange = function (resp) {
    console.log("On room change");
    console.log(resp);
  }
  exports.onRoomMemberChange = function (resp) {
    console.log("On room member change");
    console.log(resp);
  }
  exports.onStatusReceived = function (resp) {
    console.log("On status received");
    console.log(resp);    
  }
  
  // Exports to window.
  window.backend = exports;
  
})();

