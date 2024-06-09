import {assert} from "../utils/assert.js";

export default async function connectionChooser(settings) {
    let mode;
    if (settings.connection === "websocket") {
        mode = await import("./socket.js");
    } else if (settings.connection === "fake") {
        mode = await import("./fake.js");
    } else if (settings.mode === "net" && settings.connection === "webrtc") {
        mode = await import("./client.js");
    } else if (settings.mode === "server" && settings.connection === "webrtc") {
        mode = await import("./server.js");
    } else {
        assert(false, "Unsupported mode");
    }
    return mode.default;
}
