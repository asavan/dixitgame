package ru.asavan.drixit;

import android.util.Log;

import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.util.Collection;
import java.util.stream.Collectors;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

public class ChatServer extends WebSocketServer {

    public ChatServer(int port) {
        super(new InetSocketAddress(port));
    }

    private Collection<WebSocket> getOtherConnections(WebSocket conn) {
        return getConnections().stream().filter(c -> c != conn)
                .collect(Collectors.toList());
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        broadcast(message, getOtherConnections(conn));
    }

    @Override
    public void onMessage(WebSocket conn, ByteBuffer message) {
        broadcast(message, getOtherConnections(conn));
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        Log.e("WEBSOCKET_SERVER_TAG", "soketErr", ex);
    }

    @Override
    public void onStart() {
        // setConnectionLostTimeout(0);
        // setConnectionLostTimeout(100);
    }
}
