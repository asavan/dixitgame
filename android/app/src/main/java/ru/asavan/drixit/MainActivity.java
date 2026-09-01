package ru.asavan.drixit;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;

import androidx.activity.ComponentActivity;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;


public class MainActivity extends ComponentActivity {

    private SharedPreferences prefs;

    private final ActivityResultLauncher<Uri> openDocumentTreeLauncher =
            registerForActivityResult(new ActivityResultContracts.OpenDocumentTree(), uri -> {
                // Обращаемся к константам через HttpServerService
                if (uri != null) {
                    int takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION;
                    getContentResolver().takePersistableUriPermission(uri, takeFlags);

                    prefs.edit().putString(HttpServerService.KEY_FOLDER_URI, uri.toString()).apply();
                    sendUriToService(uri);
                } else {
                    prefs.edit().remove(HttpServerService.KEY_FOLDER_URI).apply();
                    sendUriToService(null);
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        // Используем константу имени настроек из сервиса
        prefs = getSharedPreferences(HttpServerService.PREFS_NAME, Context.MODE_PRIVATE);

        // Запуск сервиса при старте
        Intent serviceIntent = new Intent(this, HttpServerService.class);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }

        // Кнопка выбора папки
        findViewById(R.id.check_memory).setOnClickListener(v -> {
            String currentUriString = prefs.getString(HttpServerService.KEY_FOLDER_URI, null);
            Uri initialUri = currentUriString != null ? Uri.parse(currentUriString) : null;
            openDocumentTreeLauncher.launch(initialUri);
        });
    }

    private void sendUriToService(Uri uri) {
        Intent intent = new Intent(this, HttpServerService.class);
        intent.putExtra(HttpServerService.EXTRA_FOLDER_URI, uri);

        if (uri != null) {
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        }

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            startForegroundService(intent);
        } else {
            startService(intent);
        }
    }
}
