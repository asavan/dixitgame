import handlersFunc from "../utils/handlers.js";

import {createSignalingChannel} from "./common.js";


const connectionFunc = function (id, logger) {
    const user = id;

    const handlers = handlersFunc(["recv", "open", "error", "close", "socket_open", "socket_close"]);
    function on(name, f) {
        return handlers.on(name, f);
    }

    // init
    let isConnected = false;
    let dataChannel = null;

    const sendRawTo = (action, data, to) => {
        if (!dataChannel) {
            return false;
        }
        if (!isConnected) {
            console.error("Not connected");
            return false;
        }
        const json = {from: id, to, action, data};
        return dataChannel.send(JSON.stringify(json));
    };

    // inspired by
    // http://udn.realityripple.com/docs/Web/API/WebRTC_API/Perfect_negotiation#Implementing_perfect_negotiation
    // and https://w3c.github.io/webrtc-pc/#perfect-negotiation-example
    async function connect(socketUrl) {
        const signaling = createSignalingChannel(id, socketUrl, logger);
        signaling.on("close", (data) => handlers.call("socket_close", data));

        signaling.on("open", () => {
            handlers.call("socket_open", {});
            signaling.send("connected", {id}, "all");
        });

        signaling.on("error", (data) => handlers.call("error", data));

        await signaling.ready();
        const peerConnection = new RTCPeerConnection(null);

        peerConnection.onicecandidate = e => {
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
            signaling.send("candidate", message, "server");
        };
        // window.pc = peerConnection;

        peerConnection.oniceconnectionstatechange = () => {
            if (peerConnection.iceConnectionState === "failed") {
                console.error("failed");
            // peerConnection.restartIce();
            }
        };

        dataChannel = peerConnection.createDataChannel("gamechannel"+id);

        setupDataChannel(dataChannel, signaling);

        // const sdpConstraints = {offerToReceiveAudio: false, offerToReceiveVideo: false};

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);


        signaling.on("message", async (json) => {
            if (json.from === user) {
                console.error("same user");
                return;
            }

            // TODO delete server
            if (json.from !== "server") {
                console.log("not from server");
                return;
            }

            if (json.to !== user) {
                console.log("wrong recipient", user, json.to);
                return;
            }
            logger.log("Websocket message received: ", json);

            if (json.action === "candidate") {
                logger.log("ON CANDIDATE");
                if (!json.data.candidate) {
                    await peerConnection.addIceCandidate(null);
                } else {
                    await peerConnection.addIceCandidate(json.data);
                }

            } else if (json.action === "answer") {
                peerConnection.setRemoteDescription(json.data);
            } else if (json.action === "connected") {
                // WHY we need this?
            } else if (json.action === "close") {
                // need for server
            } else {
                console.error("Unknown type " + json.action);
            }
        });

        return signaling.send("offer", {type: "offer", sdp: offer.sdp}, "server");
    }

    function setupDataChannel(dataChannel, signaling) {
        dataChannel.onmessage = function (e) {
            logger.log("data get " + e.data);
            handlers.call("recv", e.data);
        };

        dataChannel.onopen = function () {
            logger.log("------ DATACHANNEL OPENED ------");
            isConnected = true;
            signaling.send("close", {}, "server");
            signaling.close();
            handlers.call("open", {id, sendRawTo});
        };

        dataChannel.onclose = function () {
            logger.log("------ DC closed! ------");
            isConnected = false;
        };

        dataChannel.onerror = function () {
            console.log("DC ERROR!!!");
        };
    }


    function registerHandler(actions, queue) {
        handlers.setOnce("recv", (data) => {
            // console.log(data);
            const obj = JSON.parse(data);
            const res = obj.data;
            const callback = actions[obj.action];
            if (typeof callback === "function") {
                queue.add(() => callback(res, obj.from));
            }
        });
    }

    return {connect, on, registerHandler, sendRawTo};
};

export default connectionFunc;
