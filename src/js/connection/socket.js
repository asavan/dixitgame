import handlersFunc from "../utils/handlers.js";
import {createSignalingChannel} from "./common.js";

export default function connectionFunc(id, logger, isServer) {
    const handlers = handlersFunc([
        "close",
        "disconnect",
        "error",
        "open",
        "gameinit",
        "reconnect",
        "socket_open",
        "socket_close"
    ]);

    function on(name, f) {
        return handlers.on(name, f);
    }

    let currentHandler = {};
    let queue;
    let dataChannel;

    function registerHandler(handler, q) {
        queue = q;
        currentHandler = handler;
    }

    function callCurrentHandler(method, data) {
        const callback = currentHandler[method];
        if (typeof callback !== "function") {
            logger.log("Not function");
            return;
        }
        if (!queue) {
            logger.log("No queue");
            return;
        }
        queue.add(() => callback(data.data, data.from));
    }

    function connect(socketUrl) {
        return new Promise((resolve, reject) => {
            const signaling = createSignalingChannel(id, socketUrl, logger);
            dataChannel = signaling;
            signaling.on("error", (id) => {
                logger.log("Connection to ws error " + id);
                reject(id);
            });

            signaling.on("message", function(json) {
                if (json.from === id) {
                    logger.error("same user");
                    return;
                }

                if (json.to !== id && json.to !== "all") {
                    logger.log("another user");
                    return;
                }

                if (json.ignore && Array.isArray(json.ignore) && json.ignore.includes(id)) {
                    logger.log("user in ignore list");
                    return;
                }

                if (json.action === "connected") {
                    if (isServer) {
                        signaling.send("open", {id}, json.from);
                        return handlers.call("open", {id: json.from});
                    }
                    return;
                }

                if (handlers.actionKeys().includes(json.action)) {
                    logger.log("handlers.actionKeys");
                    return handlers.call(json.action, json);
                }
                if (Object.keys(currentHandler).includes(json.action)) {
                    logger.log("callCurrentHandler");
                    return callCurrentHandler(json.action, json);
                }
                logger.log("Unknown action " + json.action);
            });

            signaling.on("close", (data) => {
                return handlers.call("socket_close", data);
            });

            signaling.on("open", () => {
                handlers.call("socket_open", {});
                signaling.send("connected", {id}, "all");
                return resolve();
            });
        });
    }

    const sendRawTo = (action, data, to) => {
        if (!dataChannel) {
            return false;
        }
        return dataChannel.send(action, data, to);
    };

    const sendRawAll = (type, data, ignore) => {
        if (!dataChannel) {
            return false;
        }
        logger.log(data);
        return dataChannel.send(type, data, "all", ignore);
    };

    return {
        connect,
        on,
        registerHandler,
        sendRawTo,
        sendRawAll,
    };
}
