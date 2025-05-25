package ru.asavan.drixit;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;

import java.io.IOException;

public class MainService extends Service {
    private AndroidStaticAssetsServer server = null;
    private ChatServer webSocketServer = null;

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        startService(Settings.STATIC_CONTENT_PORT, Settings.WEB_SOCKET_PORT, Settings.SECURE);
    }

    public void startService(int staticContentPort, int webSocketPort, boolean secure) {
        Context applicationContext = getApplicationContext();
        try {
            server = new AndroidStaticAssetsServer(applicationContext, staticContentPort, secure);
            if (webSocketServer == null) {
                webSocketServer = new ChatServer(webSocketPort);
                webSocketServer.start();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void onDestroy() {
        if (server != null) {
            server.stop();
            server = null;
        }
        if (webSocketServer != null) {
            try {
                webSocketServer.stop(1000);
                webSocketServer = null;
            } catch (InterruptedException e) {
                Log.e("MainService", "onDestroy timeout", e);
            }
        }
        super.onDestroy();
    }
}
