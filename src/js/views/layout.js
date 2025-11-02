import {drawCard2} from "./basic_views.js";

import chooseCard from "./choose_card.js";
import { assert, delay } from "netutils";
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
        const plIndex = Number.parseInt(player.dataset.id, 10);
        if (nonNegativeDigitOnIndex(cardsOnTable, plIndex)) {
            player.classList.add("done");
        } else {
            player.classList.remove("done");
        }
    }
}

function drawScore(document, player, score) {
    if (score === 0) {
        return;
    }
    const scoreDiv = document.createElement("div");
    scoreDiv.classList.add("score-diff", "relative");
    const overlay = document.createElement("div");
    overlay.classList.add("overlay-box");
    scoreDiv.appendChild(overlay);
    let scoreText = "+" + score;
    if (score < 0) {
        scoreText = score;
    }
    overlay.textContent = scoreText;
    player.prepend(scoreDiv);
    setTimeout(() => {
        overlay.classList.add("large");
    }, 100);
}

async function drawScoreAll(document, scoreDiff) {
    const allPlayers = document.querySelectorAll(".js-player");
    for (const player of allPlayers) {
        const plIndex = Number.parseInt(player.dataset.id, 10);
        const score = scoreDiff[plIndex];
        drawScore(document, player, score);
        await delay(500);
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
        const cardNum = Number.parseInt(card.dataset.card, 10);
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
        scoreElem.classList.add("score-cnt");
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
        }

        const nameElem = document.createElement("div");
        nameElem.classList.add("player-name");
        nameElem.textContent = pl.getName();
        elem.appendChild(nameElem);

        const score = pl.getScore();
        if (score > 0) {
            const scoreElem = document.createElement("div");
            scoreElem.classList.add("score-cnt");
            scoreElem.textContent = score;
            elem.appendChild(scoreElem);
        }


        elem.dataset.id = i;
        const pathPercent = 25 + Math.floor(((i-myIndex+N)%N)*100/N);
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

export default {
    drawLayout,
    drawOpenPile,
    drawGuessesFull,
    drawScoreAll
};
