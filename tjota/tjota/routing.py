from channels import route, route_class

from chat.consumer import ChatWebsocketConsumer


channel_routing = [
    route_class(ChatWebsocketConsumer, path=r'^/backend'),
]
