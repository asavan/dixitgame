package ru.asavan.drixit;

import android.content.Context;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import fi.iki.elonen.NanoWSD;

public class WebSocketBroadcastServer extends NanoWSD {

    private final List<WebSocket> list;

    public WebSocketBroadcastServer(Context context, int port, boolean secure) {
        super(port);
        list = new ArrayList<>();
        if (secure) {
            SslHelper.addSslSupport(context, this);
        }
    }

    @Override
    protected WebSocket openWebSocket(IHTTPSession handshake) {
        return new DumbWebSocket(handshake, this);
    }

    @Override
    public void stop() {
        try {
            disconectAll();
        } catch (Exception ex) {
            // ignore
        }
        super.stop();
    }

    void addUser(WebSocket user) {
        list.add(user);
    }

    void removeUser(WebSocket user) {
        list.remove(user);
    }

    public void broadcast(WebSocket sender, WebSocketFrame message) {
        try {
            message.setUnmasked();
            for (WebSocket ws : list) {
                if (ws != sender) {
                    ws.sendFrame(message);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void disconectAll() {
        for (WebSocket ws : list) {
            try {
                ws.close(WebSocketFrame.CloseCode.NormalClosure, "exit", false);
            } catch (Exception e) {
                // ignore
            }
        }
    }
}
