import settingsOriginal from "./settings.js";
import {
    adjustMode,
    adjustBots,
    adjustSeed,
    adjustOther
} from "./utils/parse-settings.js";
import { assert, parseSettings } from "netutils";
import rngFunc from "./utils/random.js";

export default async function starter(window, document) {
    const settings = { ...settingsOriginal };
    const changed = parseSettings(window.location.search, settings);
    const rngEngine = Math.random;
    adjustMode(changed, settings, window.location.protocol);
    adjustBots(changed, settings);
    adjustOther(changed, settings);
    adjustSeed(changed, settings, rngFunc, rngEngine);

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
            console.error(error);
        });
}
