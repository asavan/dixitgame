import handlersFunc from "../utils/handlers.js";

import rngFunc from "../utils/random.js";

function stub() {
    // do nothing.
}

export function getMyId(window, settings, rngEngine) {
    const data = window.sessionStorage.getItem(settings.idNameInStorage);
    if (data) {
        return data;
    }
    const newId = rngFunc.makeId(settings.idNameLen, rngEngine);
    window.sessionStorage.setItem(settings.idNameInStorage, newId);
    return newId;
}

export function getWebSocketUrl(settings, location) {
    if (settings.wh) {
        return settings.wh;
    }
    if (location.protocol === "https:") {
        return;
    }
    return "ws://" + location.hostname + ":" + settings.wsPort;
}

export function createSignalingChannel(id, socketUrl, logger) {
    const handlers = handlersFunc(["error", "open", "message", "beforeclose", "close"]);
    const ws = new WebSocket(socketUrl);

    const send = (type, sdp, to, ignore) => {
        const json = {from: id, to: to, action: type, data: sdp, ignore};
        logger.log("Sending [" + id + "] to [" + to + "]: " + JSON.stringify(sdp));
        return ws.send(JSON.stringify(json));
    };

    const close = async () => {
        // iphone fires "onerror" on close socket
        await handlers.call("beforeclose", id);
        ws.onerror = stub;
        return ws.close();
    };

    function ready() {
        return new Promise((resolve) => {
            if (ws.readyState === 1) {
                resolve();
            } else {
                ws.addEventListener("open", resolve);
            }
        });
    }

    const on = (name, f) => {
        return handlers.on(name, f);
    };

    function onMessageInner(text) {
        logger.log("Websocket message received: " + text);
        const json = JSON.parse(text);
        return handlers.call("message", json);
    }

    ws.addEventListener("open", function() {
        return handlers.call("open", id);
    });

    ws.onclose = function (e) {
        logger.log("Websocket closed " + e.code + " " + e.reason);
        return handlers.call("close", id);
    };

    ws.onmessage = async function (e) {
        if (e.data instanceof Blob) {
            const text = await e.data.text();
            return onMessageInner(text);
        } else {
            return onMessageInner(e.data);
        }
    };
    ws.onerror = function (e) {
        logger.error(e);
        return handlers.call("error", id);
    };
    return {on, send, close, ready};
}
