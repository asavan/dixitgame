import {delay} from "../utils/timer.js";

import {drawBack, drawCard, drawCard2, repaintCard} from "./basic_views.js";

import shuffle from "./shuffle.js";

import chooseCard from "./choose_card.js";
import { assert } from "../utils/assert.js";
import {nonNegativeDigitOnIndex} from "../utils/array.js";

function showCards(settings) {
    return settings.showAll || settings.clickAll;
}

function drawHand(document, parent, pile, urlGen) {
    const hand = document.createElement("ul");
    const cardItem = document.querySelector("#card2");
    hand.classList.add("hand");
    for (const p of pile) {
        hand.appendChild(drawCard2(p, cardItem, urlGen));
    }
    parent.appendChild(hand);
    return hand;
}

function drawOpenPile(document, pile, urlGen, myCard) {
    const parent = document.querySelector(".my-hand");
    let hand = parent.querySelector(".hand");
    if (hand) {
        hand.remove();
    }
    hand = drawHand(document, parent, pile, urlGen);
    const cardEl = hand.querySelector(`[data-card="${myCard}"]`);
    if (cardEl) {
        cardEl.classList.add("faint");
    }
}

function drawGuesses(document, cardsOnTable) {
    const allPlayers = document.querySelectorAll(".js-player");
    for (const player of allPlayers) {
        const plIndex = parseInt(player.dataset.id, 10);
        if (nonNegativeDigitOnIndex(cardsOnTable, plIndex)) {
            player.classList.add("done");
        } else {
            player.classList.remove("done");
        }
    }
}

function drawMyGuess(document, cardsOnTable, myIndex) {
    const allCards = document.querySelectorAll(".card");
    if (!nonNegativeDigitOnIndex(cardsOnTable, myIndex)) {
        for (const card of allCards) {
            card.classList.remove("checked");
        }
        return;
    }
    const myCard = cardsOnTable[myIndex];
    for (const card of allCards) {
        const cardNum = parseInt(card.dataset.card, 10);
        if (cardNum === myCard) {
            card.classList.add("checked");
        } else {
            card.classList.remove("checked");
        }
    }
}

function drawGuessesFull(document, cardsOnTable, myIndex) {
    drawGuesses(document, cardsOnTable);
    drawMyGuess(document, cardsOnTable, myIndex);
}

function drawMyHand({document, myIndex, players, logger, dealer, urlGen, onChoose}, box) {
    const myPlayer = players[myIndex];
    const elem = document.createElement("div");
    elem.classList.add("my-hand", "js-player");
    const statusRow = document.createElement("div");
    statusRow.classList.add("row");
    const nameElem = document.createElement("span");
    const playerName = myPlayer.getName();
    nameElem.textContent = playerName;
    nameElem.classList.add("player-name");
    statusRow.appendChild(nameElem);

    const score = myPlayer.getScore();
    if (score > 0) {
        const scoreElem = document.createElement("span");
        scoreElem.textContent = score;
        statusRow.appendChild(scoreElem);
    }

    elem.appendChild(statusRow);
    elem.dataset.id = myIndex;

    logger.log("drawMyHand", {dealer, myIndex});
    if (dealer === myIndex) {
        elem.classList.add("dealer");
    }

    drawHand(document, elem, myPlayer.pile(), urlGen);
    elem.addEventListener("click", (e) => {
        e.preventDefault();
        const cardEl = e.target.parentElement;
        if (cardEl && cardEl.classList.contains("card")) {
            const card = Number.parseInt(cardEl.dataset.card);
            logger.log(card);
            return chooseCard(document, card, myIndex, urlGen).then(onChoose).catch((e) => logger.log(e));
        }
    });

    box.appendChild(elem);
}


function drawLayout(data) {
    const {document, myIndex, settings, players, dealer, logger, urlGen, onChoose} = {...data};
    assert(document, "No document");
    const box = document.querySelector(".places");
    assert(box, "No places");
    // clean old state
    box.classList.remove("loading", "flying-cards");
    box.replaceChildren();
    const places = document.createElement("ul");
    places.classList.add("circle-wrapper");
    box.appendChild(places);
    const increaseDeg = 360 / players.length;
    const N = players.length;
    let i = 0;
    for (const pl of players) {
        if (i === myIndex) {
            ++i;
            continue;
        }

        const elem = document.createElement("li");
        elem.classList.add("js-player");

        if (showCards(settings)) {
            elem.classList.add("show-all");
            drawHand(document, elem, pl.pile(), urlGen);
            if (settings.clickAll) {
                const plNum = i;
                elem.addEventListener("click", (e) => {
                    e.preventDefault();
                    const cardEl = e.target.parentElement;
                    if (cardEl && cardEl.classList.contains("card")) {
                        const card = Number.parseInt(cardEl.dataset.card);
                        logger.log(card, plNum);
                        return chooseCard(document, card, plNum, urlGen).then(onChoose).catch((e) => logger.log(e));
                        // return engine.moveToDiscard(plNum, card);
                    }
                });
            }
        } else {
            if (pl.pile().length < settings.cardsDeal) {
                elem.classList.add("done");
            }
            // const pileElem = document.createElement("div");
            //
            // pileElem.textContent = pl.pile().length;
            // pileElem.classList.add("card-count");
            // elem.appendChild(pileElem);
        }

        const nameElem = document.createElement("div");
        nameElem.classList.add("player-name");
        nameElem.textContent = pl.getName();
        elem.appendChild(nameElem);

        const score = pl.getScore();
        if (score > 0) {
            const scoreElem = document.createElement("div");
            scoreElem.textContent = score;
            elem.appendChild(scoreElem);
        }


        elem.dataset.id = i;
        const angleDeg = 90 + increaseDeg*(i-myIndex);
        elem.dataset.angle = angleDeg + "deg";
        elem.style.setProperty("--angle-deg", angleDeg + "deg");
        const pathPercent = 25 + ((i-myIndex+N)%N)*100/N;
        elem.style.setProperty("--path-pc", pathPercent);
        elem.classList.add("circle");
        if (dealer === i) {
            elem.classList.add("dealer");
        }
        ++i;

        places.appendChild(elem);
    }
    drawMyHand(data, box);
}

async function drawDeal({document, card, animTime}) {
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");

    const flipItem = document.querySelector("#flip-card");
    const flipClone = flipItem.content.cloneNode(true).firstElementChild;
    const flipList = flipClone.querySelector(".card-flip");
    const cardItem = document.querySelector("#card");
    const newCard = drawCard(card, cardItem);
    newCard.classList.add("card-face");
    const backClone = drawBack(document);
    backClone.classList.add("card-face", "card-face-back");
    flipList.appendChild(newCard);
    flipList.appendChild(backClone);
    list.appendChild(flipClone);

    const myHand = document.querySelector(".my-hand .hand");
    const newCard1 = drawCard(card, cardItem);
    newCard1.classList.add("transparent");
    myHand.appendChild(newCard1);

    const dx = newCard1.getBoundingClientRect().x - flipList.getBoundingClientRect().x;
    const dy = newCard1.getBoundingClientRect().y - flipList.getBoundingClientRect().y;

    const newspaperSpinning = [
        { transform: "rotateY(180deg)" },
        { transform: `rotateY(0) translate(calc(${dx}px + 100%), ${dy}px)` },
    ];

    const newspaperTiming = {
        duration: animTime,
        easing: "ease-out",
        fill: "forwards"
    };
    if (typeof flipList.animate === "function") {
        flipList.animate(newspaperSpinning, newspaperTiming);
        await delay(animTime);
    }
    flipClone.remove();
    newCard1.classList.remove("transparent");
}

async function drawDealOther({document, card, animTime, target, newCount, logger}) {
    if (!target) {
        logger.error("No target");
        return;
    }
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");

    const flipItem = document.querySelector("#flip-card");
    const flipClone = flipItem.content.cloneNode(true).firstElementChild;
    const flipList = flipClone.querySelector(".card-flip");
    const cardItem = document.querySelector("#card");
    const newCard = drawCard(card, cardItem);
    newCard.classList.add("card-face");
    const backClone = drawBack(document);
    backClone.classList.add("card-face", "card-face-back");
    flipList.appendChild(newCard);
    flipList.appendChild(backClone);
    list.appendChild(flipClone);

    const tRect = target.getBoundingClientRect();
    const dx = -tRect.x + flipList.getBoundingClientRect().x - tRect.width/2;
    const dy = tRect.y - flipList.getBoundingClientRect().y + tRect.height/2;

    const newspaperSpinning = [
        { transform: "rotateY(180deg)" },
        { transform: `rotateY(180deg) translate(calc(${dx}px), ${dy}px) scale(0)`},
    ];

    const newspaperTiming = {
        duration: animTime,
        easing: "ease-out",
        fill: "forwards"
    };
    if (typeof flipList.animate === "function") {
        flipList.animate(newspaperSpinning, newspaperTiming);
        await delay(animTime/2);
    }
    target.textContent = newCount;
    await delay(animTime/2);
    flipClone.remove();
}


async function drawMove({document, cardEl, animTime}) {
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");

    const card = Number.parseInt(cardEl.dataset.card, 10);

    const flipItem = document.querySelector("#flip-card");
    const flipClone = flipItem.content.cloneNode(true).firstElementChild;
    const flipList = flipClone.querySelector(".card-flip");
    cardEl.classList.add("card-face");
    const backClone = drawBack(document);
    backClone.classList.add("card-face", "card-face-back");
    flipList.appendChild(cardEl);
    flipList.appendChild(backClone);
    list.appendChild(flipClone);


    const dx = cardEl.getBoundingClientRect().x - flipList.getBoundingClientRect().x;
    const dy = cardEl.getBoundingClientRect().y - flipList.getBoundingClientRect().y;
    cardEl.classList.add("transparent");

    const slide = [
        { transform: `translate(calc(${dx}px + 100%), ${dy}px)` },
        { transform: "translate(0, 0)" }
    ];

    const shrink = [
        {},
        { width: "0%" }
    ];

    const timing = {
        duration: animTime,
        easing: "linear",
        fill: "forwards"
    };
    if (typeof flipList.animate === "function") {
        flipList.animate(slide, timing);
        cardEl.animate(shrink, timing);
        await delay(animTime);
    }
    const cardToRepaint = list.querySelector(".card");
    repaintCard(card, cardToRepaint);
    cardEl.remove();
    flipClone.remove();
}

async function drawMoveOther({document, fromEl, animTime, card, newCount}) {
    const centerPile = document.querySelector(".center-pile");
    const list = centerPile.querySelector(".hand");

    const flipItem = document.querySelector("#flip-card");
    const flipClone = flipItem.content.cloneNode(true).firstElementChild;
    const flipList = flipClone.querySelector(".card-flip");
    const cardItem = document.querySelector("#card");
    const newCard = drawCard(card, cardItem);
    newCard.classList.add("card-face");
    const backClone = drawBack(document);
    backClone.classList.add("card-face", "card-face-back");
    flipList.appendChild(newCard);
    flipList.appendChild(backClone);
    list.appendChild(flipClone);


    const dx = fromEl.getBoundingClientRect().x - flipList.getBoundingClientRect().x;
    const dy = fromEl.getBoundingClientRect().y - flipList.getBoundingClientRect().y;

    const slide = [
        { transform: `translate(calc(${dx}px + 100%), ${dy}px) scale(0)` },
        { transform: "translate(0, 0) scale(1)" }
    ];

    const timing = {
        duration: animTime,
        easing: "linear",
        fill: "forwards"
    };
    if (typeof flipList.animate === "function") {
        flipList.animate(slide, timing);
        await delay(animTime/2);
    }

    fromEl.textContent = newCount;
    await delay(animTime/2);
    const cardToRepaint = list.querySelector(".card");
    repaintCard(card, cardToRepaint);
    flipClone.remove();
}

function drawMoveByCard({document, card, animTime}) {
    const myHand = document.querySelector(".my-hand .hand");
    const cardEl = myHand.querySelector(`[data-card="${card}"]`);
    return drawMove({document, cardEl, animTime});
}

export default {
    drawLayout,
    drawDeal,
    drawOpenPile,
    drawMoveOther,
    drawDealOther,
    drawMoveByCard,
    drawMove,
    drawGuesses,
    drawGuessesFull,
    drawShuffle: shuffle,
};
