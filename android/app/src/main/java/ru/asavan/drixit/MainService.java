package ru.asavan.drixit;

import android.app.ForegroundServiceStartNotAllowedException;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.app.ServiceCompat;

import java.io.IOException;

public class MainService extends Service {
    public static final String CHANNEL_ID = "CHANNEL_ID";
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

    @Override
    public int onStartCommand(final Intent intent, int flags, int startId) {
        // boolean stopService = intent.getBooleanExtra("request_stop", false);
        startForeground();
        return START_STICKY;
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

    private void startForeground() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "ChannelN", NotificationManager.IMPORTANCE_DEFAULT);
                channel.setDescription("channel for foreground service notification");

                var notificationManager = getSystemService(NotificationManager.class);
                notificationManager.createNotificationChannel(channel);
            }
            Notification notification =
                    new NotificationCompat.Builder(this, CHANNEL_ID)
                            .setContentTitle(getString(R.string.app_name))
                            .setContentText("Server Running")
                            .setAutoCancel(true)
                            .build();
            int type = 0;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                type = ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC;
            }
            ServiceCompat.startForeground(
                    /* service = */ this,
                    /* id = */ 100, // Cannot be 0
                    /* notification = */ notification,
                    /* foregroundServiceType = */ type
            );
        } catch (Exception e) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
                    e instanceof ForegroundServiceStartNotAllowedException
            ) {
                // App not in a valid state to start foreground service
                // (e.g started from bg)
                Log.e("MainService", "ForegroundServiceStartNotAllowedException", e);
            } else {
                Log.e("MainService", "startForeground", e);
            }
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
