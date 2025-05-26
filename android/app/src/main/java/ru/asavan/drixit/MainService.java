package ru.asavan.drixit;

import static ru.asavan.drixit.AndroidWebServerActivity.MAIN_LOG_TAG;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.net.wifi.WifiManager;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;

import java.io.IOException;

public class MainService extends Service {
    private AndroidStaticAssetsServer server = null;
    private ChatServer webSocketServer = null;

    private WifiManager.WifiLock mWiFiLock;


    public class LocalBinder extends Binder {
        MainService getService() {
            // Return this instance of LocalService so clients can call public methods
            return MainService.this;
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return mBinder;
    }

    private final IBinder mBinder = new LocalBinder();

//    @Nullable
//    @Override
//    public IBinder onBind(Intent intent) {
//        return null;
//    }

    @Override
    public void onCreate() {
        Log.i(MAIN_LOG_TAG, "start service 1");
        startService(Settings.STATIC_CONTENT_PORT, Settings.WEB_SOCKET_PORT, Settings.SECURE);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(MAIN_LOG_TAG, "Start service 2");
        return super.onStartCommand(intent, flags, startId);
    }

    public void startService(int staticContentPort, int webSocketPort, boolean secure) {
        Context applicationContext = getApplicationContext();
        try {
            server = new AndroidStaticAssetsServer(applicationContext, staticContentPort, secure);
            server.start1();
            if (webSocketServer == null) {
                webSocketServer = new ChatServer(webSocketPort);
                webSocketServer.start();
            }

            WifiManager manager = applicationContext.getSystemService(WifiManager.class);
            if (manager != null) {
                var l = WifiManager.WIFI_MODE_FULL;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    l = WifiManager.WIFI_MODE_FULL_LOW_LATENCY;
                }
                mWiFiLock = manager.createWifiLock(
                        l, MainService.class.getSimpleName());
                mWiFiLock.acquire();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void onDestroy() {
        Log.i(MAIN_LOG_TAG, "Destroy service");
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
        if (mWiFiLock != null) {
            if (mWiFiLock.isHeld()) {
                mWiFiLock.release();
            }
            mWiFiLock = null;
        }
        super.onDestroy();
    }
}
