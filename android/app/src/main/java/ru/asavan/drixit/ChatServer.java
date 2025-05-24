package ru.asavan.drixit;

import android.util.Log;

import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.util.ArrayList;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

public class ChatServer extends WebSocketServer {

    public ChatServer(int port) {
        super(new InetSocketAddress(port));
    }

    public void broadcast(WebSocket conn, String message) {
        var allConnections = getConnections();
        var connections = new ArrayList<WebSocket>(allConnections.size());
        for (var c : getConnections()) {
            if (c != conn) {
                connections.add(c);
            }
        }
        broadcast(message, connections);
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        broadcast(conn, message);
        // System.out.println(conn + ": " + message);
    }

    @Override
    public void onMessage(WebSocket conn, ByteBuffer message) {
        broadcast(message.array());
        // System.out.println(conn + ": " + message);
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
