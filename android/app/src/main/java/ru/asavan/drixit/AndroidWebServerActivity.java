package ru.asavan.drixit;

import android.app.Activity;
import android.os.Bundle;
import android.text.method.ScrollingMovementMethod;
import android.util.Log;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.LinkedHashMap;
import java.util.Map;


public class AndroidWebServerActivity extends Activity {
    private static final String WEB_GAME_URL = "https://asavan.github.io/dixitgame";
    public static final String WEB_VIEW_URL = "file:///android_asset/www/index.html";
    public static final String MAIN_LOG_TAG = "DRIXIT_TAG";
    private BtnUtils btnUtils;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        btnUtils = new BtnUtils(this);
        try {
            setupDebug(this);
            String formattedIpAddress = IpUtils.getIPAddress();
            if (formattedIpAddress != null) {
                addButtons(formattedIpAddress);
            }
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
    }

    private void showNetworkInfo(Activity activity) {
        String info = IpUtils.collectNetInfo();
        LinearLayout lView = activity.findViewById(R.id.layout);
        TextView myText = new TextView(activity);
        myText.setMovementMethod(new ScrollingMovementMethod());
        myText.setText(info);
        lView.addView(myText);
    }

    @Override
    protected void onDestroy() {
        if (btnUtils != null) {
            btnUtils.onDestroy();
        }
        super.onDestroy();
    }
}
