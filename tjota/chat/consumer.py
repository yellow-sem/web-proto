import socket
from queue import Queue
from threading import Thread

from channels.generic.websockets import WebsocketConsumer


class ChatBackendClient(object):

    TCP_BACKEND_HOST = '127.0.0.1'
    TCP_BACKEND_PORT = 4080

    def __init__(self, on_recv):
        self.on_recv = on_recv
        self.send_queue = Queue()

    def start(self):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.connect((self.TCP_BACKEND_HOST, self.TCP_BACKEND_PORT))

        self.send_thread = Thread(target=self.send_loop)
        self.send_thread.start()

        self.recv_thread = Thread(target=self.recv_loop)
        self.recv_thread.start()

    def stop(self):
        self.send_queue.put((True, 'sys:exit'))

        self.send_thread = None
        self.recv_thread = None

    def send(self, data):
        self.send_queue.put((False, data))

    def send_loop(self):
        while True:
            exit, data = self.send_queue.get()

            if data:
                data = data + "\n"
                data = data.encode()
                print('(send) >> {}'.format(data))
                self.socket.send(data)

            if exit:
                break

    def recv_loop(self):
        while True:
            data = self.socket.recv(2048)
            if not data:
                break

            print('(recv) << {}'.format(data))
            data = data.decode()
            for d in data.split('\n'):
                self.on_recv(d)


client = None


class ChatWebsocketConsumer(WebsocketConsumer):

    def connection_groups(self, **kwargs):
        return []

    def connect(self, message, **kwargs):
        global client
        if client is None:            
            client = ChatBackendClient(lambda data: self.send(text=data))
            client.start()

    def receive(self, text=None, bytes=None, **kwargs):
        global client
        client.send(text)

    def disconnect(self, message, **kwargs):
        global client
        if client is not None:
            client.stop()
