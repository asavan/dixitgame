package ru.asavan.drixit;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;


public class WebViewActivity extends Activity {

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_webview);
        WebView webView = findViewById(R.id.web);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        // webSettings.setAllowUniversalAccessFromFileURLs(true);
        // webSettings.setAllowFileAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webView.setBackgroundColor(Color.TRANSPARENT);
        // webView.setLayerType(WebView.LAYER_TYPE_SOFTWARE, null);
        String url = getIntent().getStringExtra("url");
        webView.loadUrl(url);
    }
}
