export function adjustBots(changed, settings) {
    if (!changed.includes("botCount") && settings.mode === "server") {
        settings.botCount = 0;
    }

    if (!changed.includes("clickAll")) {
        if (["ai", "hotseat"].includes(settings.mode)) {
            settings.clickAll = true;
        }
    }
    if (!changed.includes("playerIsBot")) {
        if (["ai"].includes(settings.mode)) {
            settings.playerIsBot = true;
        }
    }
}

export function adjustSeed(changed, settings, rngFunc, rngEngine) {
    if (!changed.includes("seed")) {
        return;
    }
    if (!settings.seed) {
        settings.seed = rngFunc.makeId(6, rngEngine);
    }
}

export function adjustMode(changed, settings, protocol) {
    const keepModes = ["mode", "wh"];
    for (const keepMode of keepModes) {
        if (changed.includes(keepMode)) {
            return;
        }
    }
    if (protocol === "https:") {
        settings.mode = "ai";
    }
}
