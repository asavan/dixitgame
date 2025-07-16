import handlersFunc from "../utils/handlers.js";
import {createSignalingChannel} from "./common.js";

const connectionFunc = function (id, logger) {
    const handlers = handlersFunc(["open", "error", "close", "socket_open", "socket_close", "disconnect"]);
    let clientHandler;

    function SetupFreshConnection(signaling, id) {
        const peerConnection = new RTCPeerConnection(null);
        // window.pc = peerConnection;

        peerConnection.onicecandidate = e => {
            if (!e) {
                console.error("No ice");
            }
            const message = {
                type: "candidate",
                candidate: null,
            };
            if (e.candidate) {
                message.candidate = e.candidate.candidate;
                message.sdpMid = e.candidate.sdpMid;
                message.sdpMLineIndex = e.candidate.sdpMLineIndex;
            }
            logger.log({"candidate": e.candidate});
            signaling.send("candidate", message, id);
        };

        return peerConnection;
    }

    async function processOffer(offer, peerConnection, signaling, id) {
        //    const sdpConstraints = {
        //        'mandatory':
        //            {
        //                'OfferToReceiveAudio': false,
        //                'OfferToReceiveVideo': false
        //            }
        //    };

        logger.log("------ PROCESSED OFFER ------");
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        signaling.send("answer", {type: "answer", sdp: answer.sdp}, id);
        await peerConnection.setLocalDescription(answer);
    }


    function ConnectionData(id, signaling, clients) {
        const client = clients[id];
        if (client) {
        // cleanup
            client.pc.close();
        }
        const pc = SetupFreshConnection(signaling, id);

        pc.ondatachannel = (ev) => {
            setupDataChannel(ev.channel, id, clients);
            clients[id].dc = ev.channel;
        };
        clients[id] = {pc: pc, dc: null};
        return pc;
    }

    //init

    const clients = {};

    // inspired by
    // http://udn.realityripple.com/docs/Web/API/WebRTC_API/Perfect_negotiation#Implementing_perfect_negotiation
    // and https://w3c.github.io/webrtc-pc/#perfect-negotiation-example
    function connect(socketUrl) {
        const signaling = createSignalingChannel(id, socketUrl, logger);

        signaling.on("close", (data) => handlers.call("socket_close", data));

        signaling.on("open", () => {
            handlers.call("socket_open", {});
            signaling.send("connected", {id}, "all");
        });

        signaling.on("error", (data) => handlers.call("error", data));

        signaling.on("message", async (json) => {
            if (json.from === id) {
                console.error("same user");
                return;
            }

            logger.log("Websocket message received: ", json);

            if (json.action === "candidate") {
                const client = clients[json.from];
                if (!client) {
                    console.error("No client");
                    return;
                }
                const pc = client.pc;
                if (!json.data.candidate) {
                    await pc.addIceCandidate(null);
                } else {
                    await pc.addIceCandidate(json.data);
                }

            } else if (json.action === "offer") {
                const pc = ConnectionData(json.from, signaling, clients);
                await processOffer(json.data, pc, signaling, json.from);
            } else if (json.action === "connected") {
                // TODO delete?
            } else if (json.action === "close") {
                // need for server
            } else {
                console.error("Unknown type " + json.action);
            }
        });
        return Promise.resolve(signaling);
    }

    const sendRawAll = (action, data, ignore) => {
        logger.log(data);
        const json = {from: id, to: "all", action, data};
        for (const [id, client] of Object.entries(clients)) {
            if (ignore && ignore.includes(id)) {
                logger.log("ignore " + id);
                continue;
            }
            if (client.dc) {
                try {
                    client.dc.send(JSON.stringify(json));
                } catch (e) {
                    console.log(e, client);
                }
            } else {
                console.error("No connection", client);
            }
        }
    };

    const sendRawTo = (action, data, to) => {
        const json = {from: id, to, action, data};
        const client = clients[to];
        if (!client || !client.dc) {
            logger.log("No chanel " + to);
            return;
        }
        return client.dc.send(JSON.stringify(json));
    };

    function setupDataChannel(dataChannel, id, clients) {
        dataChannel.onmessage = function (e) {
            logger.log("get data " + e.data);
            if (clientHandler) {
                const obj = JSON.parse(e.data);
                if (!clientHandler.hasAction(obj.action)) {
                    logger.error("Bad message type " + obj.action);
                    return;
                }
                return clientHandler.call(obj.action, obj.data);
            }
            logger.error("No suitable handler");
        };

        dataChannel.onopen = function () {
            logger.log("------ DATACHANNEL OPENED ------");
            // TODO make sendRawTo to send to this dataChannel
            return handlers.call("open", {sendRawTo, id});
        };

        dataChannel.onclose = async function () {
            logger.log("------ DATACHANNEL CLOSED ------");
            await handlers.call("disconnect", id);
            delete clients[id];
        };

        dataChannel.onerror = function () {
            console.error("DC ERROR!!!");
            return handlers.call("disconnect", id);
        };
    }

    function registerHandler(handler) {
        clientHandler = handler;
    }

    const on = handlers.on;

    return {
        connect,
        on,
        registerHandler,
        sendRawTo,
        sendRawAll
    };
};

export default connectionFunc;
