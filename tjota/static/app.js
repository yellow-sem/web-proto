(function (remote) {

    remote.register(function (xhr) {
        xhr.setRequestHeader('X-CSRFToken', adjax.utils.cookie('csrftoken'));
    });

    remote.apps.chat.login('test', 'test', function (success) {
        console.log('success ' + success);
    });

})(TJOTA);
