package ru.asavan.drixit;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import androidx.activity.ComponentActivity;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;

public class MainActivity extends ComponentActivity {

    private SharedPreferences prefs;

    private final ActivityResultLauncher<Uri> openDocumentTreeLauncher =
            registerForActivityResult(new ActivityResultContracts.OpenDocumentTree(), uri -> {
                if (uri != null) {
                    int takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION;
                    getContentResolver().takePersistableUriPermission(uri, takeFlags);

                    prefs.edit().putString(HttpServerService.KEY_FOLDER_URI, uri.toString()).apply();
                    // Пользователь выбрал новую папку -> отправляем её в сервис
                    startOrUpdateService(uri);
                } else {
                    prefs.edit().remove(HttpServerService.KEY_FOLDER_URI).apply();
                    // Пользователь отменил выбор -> сбрасываем сервис на assets (передаем null)
                    startOrUpdateService(null);
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        prefs = getSharedPreferences(HttpServerService.PREFS_NAME, Context.MODE_PRIVATE);

        // 1. При старте приложения достаем сохраненный Uri (если он есть)
        String savedUriString = prefs.getString(HttpServerService.KEY_FOLDER_URI, null);
        Uri savedUri = savedUriString != null ? Uri.parse(savedUriString) : null;

        // 2. Запускаем сервис с этим Uri (с автоматической проверкой разрешений)
        checkPermissionsAndStart(savedUri);

        // Кнопка выбора папки
        findViewById(R.id.check_memory).setOnClickListener(v -> {
            String currentUriString = prefs.getString(HttpServerService.KEY_FOLDER_URI, null);
            Uri initialUri = currentUriString != null ? Uri.parse(currentUriString) : null;
            openDocumentTreeLauncher.launch(initialUri);
        });
    }

    /**
     * Метод-фильтр: проверяет нужно ли запросить разрешение на уведомления (для Android 13+)
     * и затем передает Uri дальше в метод запуска.
     */
    private void checkPermissionsAndStart(Uri uri) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                // Если разрешения нет — запрашиваем встроенным методом (без ActivityCompat)
                requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 0);
            }
        }
        // В любом случае (есть разрешение, нет его, или это старый Android) — запускаем сервис
        startOrUpdateService(uri);
    }

    /**
     * Единый метод для физического запуска сервиса или отправки в него нового Uri.
     */
    private void startOrUpdateService(Uri uri) {
        Intent intent = new Intent(this, HttpServerService.class);
        intent.putExtra(HttpServerService.EXTRA_FOLDER_URI, uri);

        // Флаг прав нужен только если мы передаем реальный Uri папки
        if (uri != null) {
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent);
        } else {
            startService(intent);
        }
    }
}
