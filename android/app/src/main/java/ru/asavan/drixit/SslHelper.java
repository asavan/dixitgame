package ru.asavan.drixit;

import android.content.Context;
import android.util.Log;

import fi.iki.elonen.NanoHTTPD;

public class SslHelper {
    public static void addSslSupport(Context context, NanoHTTPD nanoHTTPD) {
        try {
            nanoHTTPD.makeSecure(NanoHTTPD.makeSSLSocketFactory(
                    "/keystore.jks", "password".toCharArray()), null);
        } catch (Exception ex) {
            Log.e("SslHelper_TAG", "SSl support error", ex);
        }
    }
}
