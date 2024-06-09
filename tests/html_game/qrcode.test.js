import test from "node:test";
import {JSDOM} from "jsdom";

import settingsOriginal from "../../src/js/settings.js";
import { makeQr } from "../../src/js/views/qr_helper.js";

test("qrcode", async () => {
    const dom = await JSDOM.fromFile("src/index.html", {
        url: "http://localhost/?mode=server&playerIsBot=false",
    });
    const document = dom.window.document;
    const settings = {...settingsOriginal};
    makeQr(dom.window, document, settings);
});
