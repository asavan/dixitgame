function stringToBoolean(string){
    switch (string.toLowerCase().trim()){
    case "true": case "yes": case "1": return true;
    case "false": case "no": case "0": case null: return false;
    default: return Boolean(string);
    }
}

export function parseSettings(queryString, settings) {
    const urlParams = new URLSearchParams(queryString);
    const changed = [];
    for (const [key, value] of urlParams) {
        if (typeof settings[key] === "number") {
            settings[key] = Number.parseInt(value, 10);
        } else if (typeof settings[key] === "boolean") {
            settings[key] = stringToBoolean(value);
        } else {
            settings[key] = value;
        }
        changed.push(key);
    }
    return changed;
}

export function adjustBots(changed, settings) {
    if (!changed.includes("botCount") && settings.mode === "server") {
        settings.botCount = 0;
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
            adjustBots(changed, settings);
            return;
        }
    }
    if (protocol === "https:") {
        settings.mode = "ai";
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
