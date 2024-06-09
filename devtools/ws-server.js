import { WebSocketServer } from "ws";
import settings from "../src/js/settings.js";
const wss = new WebSocketServer({port: settings.wsPort});
const wsList = [];

wss.on("connection", (ws, req) => {
    // https://stackoverflow.com/questions/14822708/how-to-get-client-ip-address-with-websocket-websockets-ws-library-in-node-js
    console.log("WS connection established!", req.socket.remoteAddress);
    wsList.push(ws);

    ws.on("close", function () {
        wsList.splice(wsList.indexOf(ws), 1);
        console.log("WS closed!");
    });

    ws.on("message", function (message) {
        console.log("Got ws message: " + message);
        for (const candidate of wsList) {
            // send to everybody on the site, except sender
            if (candidate !== ws) {
                candidate.send(message);
            }
        }
    });
});
