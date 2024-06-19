import starter from "./js/starter.js";
import install from "./js/views/install_as_app.js";

if (__USE_SERVICE_WORKERS__) {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./sw.js", { scope: "./" });
        install(window, document);
    }
}

starter(window, document);
