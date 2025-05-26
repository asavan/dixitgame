package ru.asavan.drixit;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.net.Uri;
import android.util.Log;
import android.widget.Button;

import com.google.androidbrowserhelper.trusted.QualityEnforcer;
import com.google.androidbrowserhelper.trusted.TwaLauncher;

import java.util.Map;

import androidx.browser.trusted.TrustedWebActivityIntentBuilder;

public class BtnUtils {
    private final Activity activity;
    private final ServiceConnection mConnection;

    public BtnUtils(Activity activity, ServiceConnection connection) {
        this.activity = activity;
        this.mConnection = connection;
    }

    public void launchWebView(String host, Map<String, String> parameters) {
        Intent intent = new Intent(activity, WebViewActivity.class);
        String launchUrl = UrlUtils.getLaunchUrl(host, parameters);
        Log.i("BTN_UTILS", launchUrl);
        intent.putExtra("url", launchUrl);
        activity.startActivity(intent);
    }

    public void addButtonBrowser(final String host, Map<String, String> parameters, int btnId) {
        Button btn = activity.findViewById(btnId);
        btn.setOnClickListener(v -> launchBrowser(host, parameters));
    }

    public void addButtonWebView(final String host, Map<String, String> parameters, int btnId) {
        Button btn = activity.findViewById(btnId);
        btn.setOnClickListener(v -> launchWebViewAndServer(host, parameters));
    }

    public void addButtonTwa(String host, Map<String, String> parameters, int id) {
        addButtonTwa(host, parameters, id, null);
    }

    public void addButtonTwa(String host, Map<String, String> parameters, int id, String text) {
        Button btn = activity.findViewById(id);
        if (text != null) {
            btn.setText(text);
        }
        btn.setOnClickListener(v -> launchTwa(host, parameters));
    }

    private void launchBrowser(String host, Map<String, String> parameters) {
        startServerAndSocket();
        Uri launchUri = Uri.parse(UrlUtils.getLaunchUrl(host, parameters));
        activity.startActivity(new Intent(Intent.ACTION_VIEW, launchUri));
    }


    private void launchWebViewAndServer(String host, Map<String, String> parameters) {
        startServerAndSocket();
        launchWebView(host, parameters);
    }

    private void launchTwa(String host, Map<String, String> parameters) {
        startServerAndSocket();
        Uri launchUri = Uri.parse(UrlUtils.getLaunchUrl(host, parameters));
        TwaLauncher launcher = new TwaLauncher(activity);
        launcher.launch(new TrustedWebActivityIntentBuilder(launchUri), new QualityEnforcer(), null, null);
    }

    private void startServerAndSocket() {
        try {
            Intent intent = new Intent(activity, MainService.class);
            activity.bindService(intent, mConnection, Context.BIND_AUTO_CREATE);
            // activity.startService(intent);
        } catch (Exception e) {
            Log.e("BTN_UTILS", "main", e);
        }
    }

    protected void onDestroy() {
        Intent intent = new Intent(activity, MainService.class);
        activity.stopService(intent);
    }
}
