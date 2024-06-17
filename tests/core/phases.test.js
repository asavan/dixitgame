import test from "node:test";
import assert from "node:assert/strict";

import { countScore } from "../../src/js/rules/phases.js";
import settingsOriginal from "../../src/js/settings.js";

test("core mimic ready", () => {
    const cardsOnTable = Array(2);
    cardsOnTable[0] = 62;
    const countSet = cardsOnTable.reduce((acc, item) => acc + (item !== undefined), 0);
    const allReady = countSet === cardsOnTable.length;
    assert.ok(!allReady, "Should not be ready");
});


test("core calcScore", () => {
    const cardsOnTable = [53, 37, 32];
    const votesMap = Array(3);
    const storyteller = 0;
    votesMap[1] = 32;
    votesMap[2] = 37;
    const state = countScore({storyteller, cardsOnTable, votesMap, ...settingsOriginal});
    const res = state.toJson();
    const scoreDiff = res.scoreDiff;
    assert.deepStrictEqual(scoreDiff, [0, 3, 3]);
});
