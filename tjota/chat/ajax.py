from adjax.registry import registry


@registry.register
def login(request, username, password):
    return {
        'success': True,
        'token': '1234',
        'user': {
            'name': 'Joe',
            'status': 'My status',
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
