package ru.asavan.drixit;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class UrlUtils {
    public static String getLaunchUrl(String host, Map<String, String> parameters) {
        StringBuilder b = new StringBuilder();
        b.append(host);
        if (parameters != null && !parameters.isEmpty()) {
            b.append("?");
            mapToParamString(b, parameters);
        }
        return b.toString();
    }

    private static void mapToParamString(StringBuilder acc, Map<String, String> parameters) {
        boolean firstElem = true;
        for (Map.Entry<String, String> p : parameters.entrySet()) {
            if (!firstElem) {
                acc.append("&");
            }
            firstElem = false;
            acc.append(p.getKey()).append("=").append(urlEncodeUTF8(p.getValue()));
        }
    }

    private static String urlEncodeUTF8(String s) {
        try {
            return URLEncoder.encode(s, StandardCharsets.UTF_8.name());
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }
}
