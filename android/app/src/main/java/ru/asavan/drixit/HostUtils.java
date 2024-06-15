package ru.asavan.drixit;

public class HostUtils {
    private final int static_content_port;
    private final int web_socket_port;
    private final boolean secure;

    public HostUtils(int static_content_port, int web_socket_port, boolean secure) {
        this.static_content_port = static_content_port;
        this.web_socket_port = web_socket_port;
        this.secure = secure;
    }

    public String getStaticHost(String ip) {
        return makeProtocol("http", secure) + ip + ":" + static_content_port;
    }

    public String getSocketHost(String ip) {
        return makeProtocol("ws", secure) + ip + ":" + web_socket_port;
    }

    private static String makeProtocol(String base, boolean secure) {
        String secureSuffix = secure ? "s" : "";
        return base + secureSuffix + "://";
    }
}
