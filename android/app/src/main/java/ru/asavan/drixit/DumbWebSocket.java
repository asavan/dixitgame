package ru.asavan.drixit;

import java.io.IOException;

import fi.iki.elonen.NanoHTTPD.IHTTPSession;
import fi.iki.elonen.NanoWSD.WebSocket;
import fi.iki.elonen.NanoWSD.WebSocketFrame;


class DumbWebSocket extends WebSocket {

    private final WebSocketBroadcastServer server;

    public DumbWebSocket(IHTTPSession handshakeRequest, WebSocketBroadcastServer server) {
        super(handshakeRequest);
        this.server = server;
    }

    @Override
    protected void onOpen() {
        server.addUser(this);
    }

    @Override
    protected void onClose(WebSocketFrame.CloseCode code, String reason, boolean initiatedByRemote) {
        server.removeUser(this);
    }

    @Override
    protected void onMessage(WebSocketFrame message) {
        server.broadcast(this, message);
    }

    @Override
    protected void onPong(WebSocketFrame pong) {
    }

    @Override
    protected void onException(IOException exception) {
        server.removeUser(this);
    }
}
