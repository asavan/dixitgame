import rngFunc from "../utils/random.js";
import PromiseQueue from "../utils/async-queue.js";
import loggerFunc from "../views/logger.js";

export default function ai(window, document, settings, gameFunction) {
    return new Promise((resolve) => {
        const playerName = "Player";
        const myId = playerName;
        if (!settings.seed) {
            settings.seed = rngFunc.makeId(6, Math.random);
        }
        const logger = loggerFunc(3, null, settings);
        const queue = PromiseQueue(logger);
        const game = gameFunction({window, document, settings, myId});
        game.setQueue(queue);

        game.join(playerName, playerName, settings.playerIsBot);

        for (let i = 0; i < settings.botCount; ++i) {
            game.addBot();
        }

        game.on("gameover", () => {
            const btnAdd = document.querySelector(".butInstall");
            btnAdd.classList.remove("hidden2");
        });


        game.afterAllJoined().then(() => {
            resolve(game);
        });
    });
}
