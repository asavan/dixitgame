package ru.asavan.drixit;

import android.util.Log;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.List;

public class IpUtils {

    public static final String LOCAL_IP = "127.0.0.1";
    public static final String LOCALHOST = "localhost";


    public static String getIPAddress() {
        try {
            List<NetworkInterface> interfaces = Collections.list(NetworkInterface.getNetworkInterfaces());

            for (NetworkInterface interface_ : interfaces) {
                for (InetAddress inetAddress : Collections.list(interface_.getInetAddresses())) {
                    if (inetAddress.isLoopbackAddress()) {
                        continue;
                    }

                    String ipAddr = inetAddress.getHostAddress();
                    if (ipAddr == null) {
                        continue;
                    }
                    boolean isIPv4 = ipAddr.indexOf(':') < 0;
                    if (!isIPv4) {
                        continue;
                    }
                    return ipAddr;
                }
            }
        } catch (Exception e) {
            Log.e("IP_LOG_TAG", "getIPAddress", e);
        }
        return null;
    }

    public static String getIPAddressSafe() {
        String formattedIpAddress = getIPAddress();
        if (formattedIpAddress != null) {
            return formattedIpAddress;
        }
        return LOCAL_IP;
    }
}
