package ru.asavan.drixit;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
import java.io.IOException;

public class HttpServerService extends Service {

    // Единое место хранения констант для SharedPreferences
    public static final String PREFS_NAME = "ServerPrefs";
    public static final String KEY_FOLDER_URI = "selected_folder_uri";
    public static final String EXTRA_FOLDER_URI = "extra_folder_uri";

    private static final String CHANNEL_ID = "HttpServerChannel";
    private HybridAndroidServer server;

    @Override
    public void onCreate() {
        super.onCreate();

        // Создаем Notification Channel для Foreground-сервиса (начиная с Android O)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, "Local Web Server", NotificationManager.IMPORTANCE_LOW);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) manager.createNotificationChannel(channel);
        }

        // Показываем уведомление, чтобы система не убила сервер в фоне
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Web Server running")
                .setContentText("Serving local files...")
                .setSmallIcon(android.R.drawable.ic_media_play)
                .build();

        startForeground(1, notification);

        // При первом запуске достаем сохраненный Uri из прошлых сессий
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String savedUriString = prefs.getString(KEY_FOLDER_URI, null);
        Uri savedUri = savedUriString != null ? Uri.parse(savedUriString) : null;

        // Инициализируем и запускаем сервер
        try {
            server = new HybridAndroidServer(this, 8080, false, "www", savedUri);
            server.start1();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && server != null) {
            Uri newUri;

            // Безопасное извлечение Parcelable с учетом версии Android
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                newUri = intent.getParcelableExtra(EXTRA_FOLDER_URI, Uri.class);
            } else {
                // Используем старый метод для обратной совместимости (подавляем warning)
                //noinspection deprecation
                newUri = intent.getParcelableExtra(EXTRA_FOLDER_URI);
            }

            server.setBaseTreeUri(newUri);
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (server != null) {
            server.stop(); // Корректно закрываем сервер при остановке сервиса
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null; // Bind нам не нужен, общаемся только через команды startService
    }
}

