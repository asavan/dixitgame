import {random} from "netutils";

function newDeck(length) {
    const deck = [ ...Array(length).keys()];
    return deck;
}

async function newShuffledDeck(onShuffle, rngFunc, length = 84) {
    const deck = newExternalDeck(newDeck(length), onShuffle, rngFunc);
    await deck.shuffle();
    return deck;
}

function newExternalDeck(d, onShuffle, rngFunc) {
    let deck = d;

    function deal() {
        const card = deck.pop();
        return card;
    }

    function setDeck(d) {
        deck = d;
    }

    function addCard(card) {
        deck.push(card);
    }

    function checkTop(card) {
        if (deck.length === 0) {
            console.log("empty deck");
            return false;
        }
        const res = deck.at(-1) === card;
        if (!res) {
            console.trace("bad deck", deck.at(-1), card, deck);
        }
        return res;
    }

    function topCard() {
        if (deck.length === 0) {
            return;
        }
        return deck.at(-1);
    }

    function addCardAndShuffle(card) {
        addCard(card);
        return shuffle();
    }

    function shuffle() {
        random.shuffleArray(deck, rngFunc);
        return onShuffle(deck);
    }

    const size = () => deck.length;

    const toJson = () => [...deck];

    return {deal, addCardAndShuffle, setDeck, checkTop, size, shuffle, topCard, toJson};
}

export default {
    newShuffledDeck, newExternalDeck, newDeck
};
