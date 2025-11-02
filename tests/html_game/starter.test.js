import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";

import starterFunc from "../../src/js/starter.js";
import settingsOriginal from "../../src/js/settings.js";


async function testMode(mode) {
    const baseUrl = "http://localhost/?botCount=2";
    const urlToTest = baseUrl + "&mode=" + mode;
    const dom = await JSDOM.fromFile("src/index.html", {
        url: urlToTest,
    });
    const document = dom.window.document;
    assert.doesNotReject(starterFunc(dom.window, document));
}

test("test modes", async () => {
    const settings = {...settingsOriginal};
    for (const mode of settings.modes) {
        await testMode(mode);
    }
    assert.ok(true, "Ended well");
});
