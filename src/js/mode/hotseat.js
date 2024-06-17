import { getMyId } from "../connection/common.js";
import startServerWithUI from "./common.js";
import genbots from "./genbots.js";

export default function hotseat({window, document, settings, rngEngine}) {
    const myId = getMyId(window, settings, rngEngine);
    const players = genbots(myId, settings);
    const starter = startServerWithUI({window, document, settings, rngEngine}, myId, players);
    const gameCore = starter.getCore();

    gameCore.on("gameover", () => {
        const btnAdd = document.querySelector(".butInstall");
        btnAdd.classList.remove("hidden2");
    });
    return starter.start();
}
