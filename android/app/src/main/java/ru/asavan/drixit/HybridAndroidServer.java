package ru.asavan.drixit;

import android.content.Context;
import android.net.Uri;
import android.provider.DocumentsContract;
import android.util.Log;
import java.io.IOException;
import java.io.InputStream;
import fi.iki.elonen.NanoHTTPD;

public class HybridAndroidServer extends NanoHTTPD {
    private final Context context;
    private final String folderToServe;
    private volatile Uri baseTreeUri;
    private static final String TAG = "HYBRID_SERVER_TAG";

    public HybridAndroidServer(Context context, int port, boolean secure, String folderToServe, Uri baseTreeUri) {
        super(port);
        this.context = context;
        this.folderToServe = folderToServe != null ? folderToServe : "www";
        setBaseTreeUri(baseTreeUri);

        if (secure) {
            SslHelper.addSslSupport(context, this);
        }
    }

    public synchronized void setBaseTreeUri(Uri baseTreeUri) {
        this.baseTreeUri = baseTreeUri;
    }

    public void start1() throws IOException {
        start();
    }

    public String onRequest(String file) {
        return file;
    }

    @Override
    public Response serve(IHTTPSession session) {
        if (session.getMethod() != Method.GET) {
            return notFound();
        }

        String file = session.getUri();
        if ("/".equals(file)) {
            file = "index.html";
        }
        if (file.startsWith("/")) {
            file = file.substring(1);
        }
        if (file.startsWith(".")) {
            file = file.substring(1);
        }

        file = onRequest(file);
        Uri currentUri = this.baseTreeUri;

        // РЕЖИМ 1: Пользовательская папка
        if (currentUri != null) {
            try {
                String treeId = DocumentsContract.getTreeDocumentId(currentUri);
                String fileId = treeId + "/" + file;
                Uri fileUri = DocumentsContract.buildDocumentUriUsingTree(currentUri, fileId);

                InputStream is = context.getContentResolver().openInputStream(fileUri);
                return newChunkedResponse(Response.Status.OK, getMimeTypeForFile(file), is);
            } catch (Exception e) {
                // Любое исключение (FileNotFound, SecurityException) превращается в 404
                Log.w(TAG, "External file not found: " + file);
            }
            return notFound();
        }

        // РЕЖИМ 2: Assets по умолчанию
        else {
            String fileWithFolder = folderToServe + "/" + file;
            try {
                InputStream is = context.getResources().getAssets().open(fileWithFolder);
                return newChunkedResponse(Response.Status.OK, getMimeTypeForFile(file), is);
            } catch (IOException e) {
                Log.w(TAG, "Asset file not found: " + fileWithFolder);
            }
            return notFound();
        }
    }

    private static Response notFound() {
        return newFixedLengthResponse(Response.Status.NOT_FOUND, NanoHTTPD.MIME_PLAINTEXT, "Not Found");
    }
}
