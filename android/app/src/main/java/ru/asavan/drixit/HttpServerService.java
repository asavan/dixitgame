package ru.asavan.drixit;

import static ru.asavan.drixit.AndroidWebServerActivity.MAIN_LOG_TAG;

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
import android.provider.DocumentsContract;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import java.io.IOException;

public class HttpServerService extends Service {

    public static final String PREFS_NAME = "ServerPrefs";
    public static final String KEY_FOLDER_URI = "selected_folder_uri";
    public static final String EXTRA_FOLDER_URI = "extra_folder_uri";

    private static final String CHANNEL_ID = "HttpServerChannel";
    private static final int NOTIFICATION_ID = 1; // ID должен быть одинаковым

    private HybridAndroidServer server;
    private NotificationManager notificationManager;

    @Override
    public void onCreate() {
        super.onCreate();

        notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        createNotificationChannel();

        // 1. При рождении сервиса сначала читаем настройки
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String savedUriString = prefs.getString(KEY_FOLDER_URI, null);
        Uri savedUri = savedUriString != null ? Uri.parse(savedUriString) : null;

        // 2. Строим уведомление с актуальным текстом на основе прочитанного Uri
        Notification initialNotification = buildNotification(savedUri);

        // 3. СРАЗУ закрепляем статус (безопасность от крэшей)
        startForeground(NOTIFICATION_ID, initialNotification);

        // 4. Запускаем сервер
        try {
            server = new HybridAndroidServer(getApplicationContext(), 8080, false, "www", savedUri);
            server.setBaseTreeUri(savedUri);
            server.start1();
        } catch (IOException e) {
            Log.e(MAIN_LOG_TAG, "Server not started", e);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && server != null) {
            Uri targetUri;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                targetUri = intent.getParcelableExtra(EXTRA_FOLDER_URI, Uri.class);
            } else {
                //noinspection deprecation
                targetUri = intent.getParcelableExtra(EXTRA_FOLDER_URI);
            }

            // Обновляем папку в сервере
            server.setBaseTreeUri(targetUri);

            // ОБНОВЛЯЕМ УВЕДОМЛЕНИЕ: отправляем в систему новую версию уведомления с тем же ID
            Notification updatedNotification = buildNotification(targetUri);
            notificationManager.notify(NOTIFICATION_ID, updatedNotification);
        }
        return START_STICKY;
    }

    /**
     * Универсальный метод сборки уведомления в зависимости от выбранного режима
     */
    private Notification buildNotification(Uri uri) {
        String contentText;
        if (uri != null) {
            // Если выбран Uri папки, вытаскиваем его человекочитаемый сегмент (название папки)
            String folderName = DocumentsContract.getTreeDocumentId(uri);
            // Очищаем от системных префиксов (опционально, зависит от нужного тебе вида)
            if (folderName.contains(":")) {
                folderName = folderName.substring(folderName.lastIndexOf(":") + 1);
            }
            contentText = "Раздаю папку: " + folderName;
        } else {
            contentText = "Раздаю встроенные ресурсы (Assets)";
        }

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Локальный Веб-Сервер")
                .setContentText(contentText)
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setOngoing(true) // Запрещает пользователю смахнуть уведомление вручную
                .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, "Local Web Server", NotificationManager.IMPORTANCE_LOW);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public void onDestroy() {
        if (server != null) {
            server.stop();
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}
