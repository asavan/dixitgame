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

    let userHandlers;
    let dataChannel;

    function registerHandler(handler) {
        userHandlers = handler;
    }

    function connect(socketUrl) {
        return new Promise((resolve, reject) => {
            const signaling = createSignalingChannel(id, socketUrl, logger);
            dataChannel = signaling;
            signaling.on("error", (data) => {
                logger.log("Connection to ws error " + data);
                reject(data);
            });

            signaling.on("message", function(json) {
                if (json.from === id) {
                    logger.error("same user");
                    return;
                }

                if (json.to !== id && json.to !== "all") {
                    logger.log("another user", json, id);
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
                if (userHandlers && userHandlers.actionKeys().includes(json.action)) {
                    logger.log("callCurrentHandler");
                    return userHandlers.call(json.action, json.data);
                }
                logger.log("Unknown action " + json.action);
            });

            signaling.on("close", data => handlers.call("socket_close", data));

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
        logger.log("sendRawAll", data);
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
