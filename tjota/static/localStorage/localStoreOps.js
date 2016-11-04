window.localStoreOps = (function () {
    
    exports = {};
    
    /* Sessions */
    
    function setSession (sessionID) {
        return window.localStorage.setItem("session", sessionID);
    }
    
    function getSession () {
        return window.localStorage.getItem("session");
    }
    
    function removeSession () {
        return window.localStorage.removeItem("session");
    }
    
    /* Usernames */
    
    function setUsername (username) {
        return window.localStorage.setItem("username", username);
    }
    
    function getUsername () {
        return window.localStorage.getItem("username");
    }
    
    function removeUsername () {
        return window.localStorage.removeItem("username");
    }
    
    /* Provider */
    
    function setProvider (provider) {
        return window.localStorage.setItem("provider", provider);
    }
    
    function getProvider () {
        return window.localStorage.getItem("provider");
    }
    
    function removeProvider () {
        return window.localStorage.removeItem("provider");
    }
    
    /* FLUSH LOCALSTORAGE */
    
    function clear () {
        return window.localStorage.clear();
    }
    
    exports.setSession = setSession;
    exports.getSession = getSession;
    exports.removeSession = removeSession;
    
    exports.setUsername = setUsername;
    exports.getUsername = getUsername;
    exports.removeUsername = removeUsername;
    
    exports.setProvider = setProvider;
    exports.getProvider = getProvider;
    exports.removeProvider = removeProvider;
    
    exports.clear = clear;
    
    return exports;
})();