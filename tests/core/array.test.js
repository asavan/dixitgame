import test from "node:test";
import assert from "node:assert/strict";
import {nonNegativeDigitOnIndex} from "../../src/js/utils/array.js";

test("cards on board", () => {
    const cardsOnBoard = []
    cardsOnBoard[2] = 0;
    cardsOnBoard[4] = 6;

    assert.ok(!nonNegativeDigitOnIndex(cardsOnBoard, 0),"no card for 0 player");
    assert.ok(!nonNegativeDigitOnIndex(cardsOnBoard, 1),"no card for 1 player");
    assert.ok(nonNegativeDigitOnIndex(cardsOnBoard, 2),"zero card ok");
    assert.ok(!nonNegativeDigitOnIndex(cardsOnBoard, 3),"no card for 3 player");
    assert.ok(nonNegativeDigitOnIndex(cardsOnBoard, 4),"ok for 4 player");
    assert.ok(!nonNegativeDigitOnIndex(cardsOnBoard, 5),"no card for 5 player");
});


test("cards on board2", () => {
    const cardsOnBoard = Array(3)
    cardsOnBoard[1] = 0;
    console.log(cardsOnBoard);

    assert.ok(!nonNegativeDigitOnIndex(cardsOnBoard, 0),"no card for 0 player");
    assert.ok(nonNegativeDigitOnIndex(cardsOnBoard, 1),"zero card ok");
    assert.ok(!nonNegativeDigitOnIndex(cardsOnBoard, 2),"no card for 2 player");
    assert.ok(!nonNegativeDigitOnIndex(cardsOnBoard, 3),"no card for 3 player");
});

test("cards on board3", () => {
    const cardsOnBoard = [null, 0, null]
    console.log(cardsOnBoard);

    assert.ok(!nonNegativeDigitOnIndex(cardsOnBoard, 0),"no card for 0 player");
    assert.ok(nonNegativeDigitOnIndex(cardsOnBoard, 1),"zero card ok");
    assert.ok(!nonNegativeDigitOnIndex(cardsOnBoard, 2),"no card for 2 player");
    assert.ok(!nonNegativeDigitOnIndex(cardsOnBoard, 3),"no card for 2 player");
});
