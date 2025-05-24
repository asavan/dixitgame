package ru.asavan.drixit;

import static ru.asavan.drixit.AndroidWebServerActivity.MAIN_LOG_TAG;

import android.util.Log;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class IpUtils {

    public static final String LOCAL_IP = "127.0.0.1";
    public static final String LOCALHOST = "localhost";

    /**
     * The interface name is used as a heuristic for deciding whether the
     * device is providing a wifi access point.
     */
    private static final Pattern AP_INTERFACE_NAME = Pattern.compile("^(wlan|ap|p2p)[-0-9]");


    public static String collectNetInfo() {
        StringBuilder builder = new StringBuilder();
        try {
            for (var interfaces = NetworkInterface.getNetworkInterfaces();
                 interfaces.hasMoreElements(); ) {
                NetworkInterface iface = interfaces.nextElement();
//                boolean up = iface.isUp();
//                if (!up ||
//                        iface.isLoopback() ||
//                        iface.isVirtual()) {
//                    continue;
//                }
                builder.append(iface.getName());
                builder.append(" ");
                builder.append(iface.getDisplayName());
                builder.append(" wlan ");
                builder.append(isWlanName(iface));
                builder.append(" virt ");
                builder.append(iface.isVirtual());
                builder.append(iface.supportsMulticast());
                builder.append(" point ");
                builder.append(iface.isPointToPoint());
                builder.append("\n");

                for (InterfaceAddress ifAddr : iface.getInterfaceAddresses()) {
                    boolean notIpv4 = !isIPv4F(ifAddr.getAddress());
                    if (notIpv4) {
                        continue;
                    }
                    builder.append("\t");
                    builder.append(ifAddr.getAddress().getHostAddress());
                    builder.append(" local ");
                    builder.append(ifAddr.getAddress().isSiteLocalAddress());
                    builder.append(" ip4 ");
                    builder.append(isIPv4F(ifAddr.getAddress()));
                    builder.append(" wifi ");
                    builder.append(isPossibleWifiApInterface(ifAddr));
                    builder.append("\n");
                }
            }
        } catch (Exception e) {
            builder.append(e);
        }
        builder.append("\n\n");
        return builder.toString();
    }

    public static List<String> apIps() {
        List<String> result = new ArrayList<>();
        List<String> possible = new ArrayList<>();
        List<String> maybe = new ArrayList<>();
        try {
            for (var interfaces = NetworkInterface.getNetworkInterfaces();
                 interfaces.hasMoreElements(); ) {
                NetworkInterface iface = interfaces.nextElement();
                if (!iface.isUp() ||
                        iface.isVirtual() ||
                        iface.isLoopback() ||
                        !iface.supportsMulticast()
                ) {
                    continue;
                }
                for (InterfaceAddress ifAddr : iface.getInterfaceAddresses()) {
                    var addr = ifAddr.getAddress();
                    if (addr.isLoopbackAddress()) {
                        continue;
                    }
                    if (isIPv4F(addr)) {
                        if (isWlanName(iface) && isPossibleWifiApInterface(ifAddr)) {
                            result.add(addr.getHostAddress());
                        } else if (isWlanName(iface)) {
                            possible.add(addr.getHostAddress());
                        } else {
                            maybe.add(addr.getHostAddress());
                        }
                    }
                }
            }
        } catch (Exception ignore) {
            //
        }
        result.addAll(possible);
        result.addAll(maybe);
        return result;
    }

    public static String getIPAddress() {
        List<String> wlanIps = apIps();
        if (!wlanIps.isEmpty()) {
            Log.i(MAIN_LOG_TAG, "Get wlans " + wlanIps.size());
            return wlanIps.get(0);
        }
        Log.i(MAIN_LOG_TAG, "No wlans");
        try {
            for (var interfaces = NetworkInterface.getNetworkInterfaces();
                 interfaces.hasMoreElements(); ) {
                NetworkInterface interface_ = interfaces.nextElement();
                for (var addrs = interface_.getInetAddresses(); addrs.hasMoreElements(); ) {
                    InetAddress inetAddress = addrs.nextElement();
                    if (inetAddress.isLoopbackAddress()) {
                        continue;
                    }
                    if (inetAddress instanceof Inet4Address ip4Addr) {
                        return ip4Addr.getHostAddress();
                    }
                }
            }
        } catch (Exception e) {
            Log.e("IP_LOG_TAG", "getIPAddress", e);
        }
        return null;
    }

    private static boolean isPossibleWifiApInterface(InterfaceAddress ifAddr) {
        if (ifAddr.getNetworkPrefixLength() != 24) return false;
        byte[] ip = ifAddr.getAddress().getAddress();
        return ip.length == 4 && ip[0] == (byte) 192 && ip[1] == (byte) 168;
    }

    private static boolean isWlanName(NetworkInterface iface) {
        return AP_INTERFACE_NAME.matcher(iface.getName()).find();
    }

    private static boolean isIPv4F(InetAddress ifAddr) {
        return ifAddr instanceof Inet4Address;
    }


    public static String getIPAddressSafe() {
        String formattedIpAddress = getIPAddress();
        if (formattedIpAddress != null) {
            return formattedIpAddress;
        }
        return LOCAL_IP;
    }
}
