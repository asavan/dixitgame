package ru.asavan.drixit;

import android.app.Activity;
import android.app.usage.StorageStatsManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.os.storage.StorageManager;
import android.text.method.ScrollingMovementMethod;
import android.util.Log;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;


public class AndroidWebServerActivity extends Activity {
    private static final String WEB_GAME_URL = "https://asavan.github.io/dixitgame";
    public static final String WEB_VIEW_URL = "file:///android_asset/www/index.html";
    public static final String MAIN_LOG_TAG = "DRIXIT_TAG";
    private BtnUtils btnUtils;

    private MainService mService;
    private boolean mBound = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.i(MAIN_LOG_TAG, "Create activity");
        setContentView(R.layout.main);
        btnUtils = new BtnUtils(this, mConnection);
        try {
            setupDebug(this);
            String formattedIpAddress = IpUtils.getIPAddress();
            if (formattedIpAddress != null) {
                addButtons(formattedIpAddress);
            }

            Button stopServiceBtn = findViewById(R.id.stop_service);
            stopServiceBtn.setOnClickListener(_ -> stopService());

            Map<String, String> mainParams = new LinkedHashMap<>();
            mainParams.put("mode", "hotseat");
            btnUtils.launchWebView(WEB_VIEW_URL, mainParams);
        } catch (Exception e) {
            Log.e(MAIN_LOG_TAG, "main", e);
        }
    }

    private void addButtons(String formattedIpAddress) {
        HostUtils hostUtils = new HostUtils(Settings.STATIC_CONTENT_PORT,
                Settings.WEB_SOCKET_PORT, Settings.SECURE);
        final String host = hostUtils.getStaticHost(formattedIpAddress);
        {
            Map<String, String> b = new LinkedHashMap<>();
            b.put("wh", hostUtils.getSocketHost(IpUtils.LOCALHOST));
            b.put("sh", host);
            b.put("mode", "server");
            btnUtils.addButtonTwa(hostUtils.getStaticHost(IpUtils.LOCALHOST), b, R.id.twa_real_ip, host);
        }
    }

    private void setupDebug(Activity activity) {
        Button btn = activity.findViewById(R.id.network_info);
        btn.setOnClickListener(v -> showNetworkInfo(activity));

        Button btn2 = activity.findViewById(R.id.check_memory);
        btn2.setOnClickListener(v -> showMemoryInfo(activity));
    }

    private void showNetworkInfo(Activity activity) {
        String info = IpUtils.collectNetInfo();
        showInfo(activity, info);
    }

    private void showMemoryInfo(Activity activity) {
        StringBuilder b = new StringBuilder();
        try {
            StorageManager storageManager =
                    getApplicationContext().getSystemService(StorageManager.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                UUID appSpecificInternalDirUuid = storageManager.getUuidForPath(getFilesDir());
                long availableBytes = storageManager.getAllocatableBytes(appSpecificInternalDirUuid);
                b.append("avail ");
                b.append(availableBytes);
                var ssm = getApplicationContext().getSystemService(StorageStatsManager.class);;
                var free = 	ssm.getFreeBytes(appSpecificInternalDirUuid);
                var total = ssm.getTotalBytes(appSpecificInternalDirUuid);
                b.append(" free ");
                b.append(free);
                b.append(" total ");
                b.append(total);
            }
        } catch (IOException ignore) {
        }
        showInfo(activity, b.toString());
    }

    private ServiceConnection mConnection = new ServiceConnection() {

        @Override
        public void onServiceConnected(ComponentName className,
                                       IBinder service) {
            // We've bound to LocalService, cast the IBinder and get LocalService instance
            MainService.LocalBinder binder = (MainService.LocalBinder) service;
            mService = binder.getService();
            mBound = true;
        }

        @Override
        public void onServiceDisconnected(ComponentName arg0) {
            mBound = false;
        }
    };

    private void stopService() {
        Intent intent = new Intent(this, MainService.class);
        stopService(intent);
    }

    private static void showInfo(Activity activity, String info) {
        LinearLayout lView = activity.findViewById(R.id.layout);
        TextView myText = new TextView(activity);
        myText.setMovementMethod(new ScrollingMovementMethod());
        myText.setText(info);
        lView.addView(myText);
    }

    @Override
    protected void onStop() {
        Log.i(MAIN_LOG_TAG, "Stop activity");
        super.onStop();
    }

    @Override
    protected void onPause() {
        Log.i(MAIN_LOG_TAG, "Pause activity");
        super.onPause();
    }

    @Override
    protected void onStart() {
        Log.i(MAIN_LOG_TAG, "Start activity");
        super.onStart();
    }

    @Override
    protected void onResume() {
        Log.i(MAIN_LOG_TAG, "onResume activity");
        super.onResume();
    }

    @Override
    protected void onRestart() {
        Log.i(MAIN_LOG_TAG, "onRestart activity");
        super.onRestart();
    }

    @Override
    protected void onDestroy() {
        Log.i(MAIN_LOG_TAG, "Destroy activity");
        if (btnUtils != null) {
            btnUtils.onDestroy();
        }
        super.onDestroy();
    }
}
