from adjax.registry import registry

# Server-side functions go here

@registry.register
def login(request, username, password):
    return username == 'test' and password == 'test'


@registry.register
def hello2(request, num1, num2):
    return num1 * num2


@registry.register
def get_messages(request):
    msg1 = {
        'time': '22:20',
        'content': 'Hello',
    }
    msg2 = {
        'time': '22:21',
        'content': 'hello2',
    }

    return [msg1, msg2]
