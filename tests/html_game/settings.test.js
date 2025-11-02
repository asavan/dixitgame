import test from "node:test";
import assert from "node:assert/strict";

import settingsOriginal from "../../src/js/settings.js";
import {adjustMode} from "../../src/js/utils/parse-settings.js";
import {parseSettings} from "netutils";


test("parse settings", () => {
    const search = "?mode=server";
    const settings = {...settingsOriginal};
    const changed = parseSettings(search, settings);
    assert.deepStrictEqual(changed, ["mode"]);
});

test("ajust settings", () => {
    const search = "?mode=server";
    const settings = {...settingsOriginal};
    const changed = parseSettings(search, settings);
    assert.ok(changed.includes("mode"));
    adjustMode(changed, settings, "https:");
    assert.equal(settings.mode, "server");
    assert.equal(settings.botCount, 0);
});

test("ajust settings2", () => {
    const search = "";
    const settings = {...settingsOriginal};
    const changed = parseSettings(search, settings);
    assert.equal(changed.length, 0);
    adjustMode(changed, settings, "https:");
    assert.equal(settings.mode, "ai");
    assert.equal(settings.botCount, 2);
});

test("ajust settings has bot", () => {
    const search = "?mode=server&botCount=3";
    const settings = {...settingsOriginal};
    const changed = parseSettings(search, settings);
    assert.ok(changed.includes("mode"));
    adjustMode(changed, settings, "https:");
    assert.equal(settings.mode, "server");
    assert.equal(settings.botCount, 3);
});


test("wh search params", () => {
    const search = "?mode=server";
    const params = new URLSearchParams(search);
    params.append("wh", "http://localhost:8088");
    assert.equal(params.toString(), "mode=server&wh=http%3A%2F%2Flocalhost%3A8088");

    params.set("wh", "http://192.168.0.27:8088");
    assert.equal(params.toString(), "mode=server&wh=http%3A%2F%2F192.168.0.27%3A8088");

    params.set("wh", "ws://localhost:8088");
    assert.equal(params.toString(), "mode=server&wh=ws%3A%2F%2Flocalhost%3A8088");

    params.set("wh", "ws://192.168.0.27:8088");
    assert.equal(params.toString(), "mode=server&wh=ws%3A%2F%2F192.168.0.27%3A8088");

});
