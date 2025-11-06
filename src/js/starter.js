import settingsOriginal from "./settings.js";
import {
    adjustMode,
    adjustBots,
    adjustSeed,
    adjustOther
} from "./utils/parse-settings.js";
import { assert, loggerFunc, parseSettings, random } from "netutils";

export default async function starter(window, document) {
    const settings = { ...settingsOriginal };
    const changed = parseSettings(window.location.search, settings);
    const rngEngine = Math.random;
    adjustMode(changed, settings, window.location.protocol);
    adjustBots(changed, settings);
    adjustOther(changed, settings);
    adjustSeed(changed, settings, random, rngEngine);

    const mainLogger = loggerFunc(document, settings);
    mainLogger.log("Choosen mode " + settings.mode);

    window.addEventListener("unhandledrejection", (event) => {
        mainLogger.error(`UNHANDLED PROMISE REJECTION: ${event.reason}`);
        // event.preventDefault();
    });

    let mode;
    if (settings.mode === "net") {
        mode = await import("./mode/net.js");
    } else if (settings.mode === "server") {
        mode = await import("./mode/server.js");
    } else if (settings.mode === "ai") {
        mode = await import("./mode/ai.js");
    } else if (settings.mode === "hotseat") {
        mode = await import("./mode/hotseat.js");
    } else {
        assert(false, "Unsupported mode");
    }
    mode.default({ window, document, settings: settings, rngEngine }).
        catch((error) => {
            mainLogger.error(error);
        });
}
