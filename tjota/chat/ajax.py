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
    return [
        "All", "Group", "Public", "Private"
    ]

@registry.register
def addchat(request, user, room):
    return {
        'success': True,
        'room': room,
    }

@registry.register
def removechat(request, user, room):
    return True