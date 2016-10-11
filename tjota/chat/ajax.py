from adjax.registry import registry


@registry.register
def login(request, username, password):
    return {
        'success': True,
        'token': '1234',
        'user': {
            'name': username,
            'status': 'I\'m so excited!',
        },
    }

@registry.register
def logout(request, token):
    return {
        'success': True,
    }

@registry.register
def status(request, token, status):
    return {
        'success': True,
    }

@registry.register
def getchatrooms(request, user):
    return {
        'success': True,
        'chatrooms': ["All", "Group", "Public", "Private"],
    }

@registry.register
def addchat(request, user, chatroom):
    return {
        'success': True,
        'chatroom': chatroom,
    }

@registry.register
def removechat(request, user, chatroom, chatrooms):
    return {
    	'success': True,
    }