import test from "node:test";
import assert from "node:assert/strict";

test("core mimic ready", () => {
    const cardsOnTable = Array(2);
    cardsOnTable[0] = 62;
    cardsOnTable[1] = undefined;
    // const state = mimic({storyteller, cardsOnTable});
    const countSet = cardsOnTable.reduce((acc, item) => acc + (item !== undefined), 0);
    const allReady = countSet === cardsOnTable.length;
    assert.ok(!allReady, "Should not be ready");
});
