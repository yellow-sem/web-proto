from adjax.registry import registry

# Server-side functions go here

@registry.register
def login(request, username, password):
    return username == 'test' and password == 'test'


@registry.register
def hello2(request, num1, num2):
    return num1 * num2
