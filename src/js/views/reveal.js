function colorizeDealerCard(dealer, cards, document) {
    const hand = document.querySelector(".hand");
    const allCards = hand.querySelectorAll(".card");
    const dealerCard = cards[dealer];
    for (const card of allCards) {
        const cardNum = Number.parseInt(card.dataset.card, 10);
        const cardIndex = cards.indexOf(cardNum);
        card.dataset.id = cardIndex;
        if (cardNum === dealerCard) {
            card.classList.add("highlight-good", "reveal", "relative");
        } else {
            card.classList.add("highlight-bad", "reveal", "relative");
        }
    }
}

function addVote(name, namesContainer, index) {
    const playerName = document.createElement("div");
    playerName.classList.add("player-guess");
    playerName.textContent = name;
    playerName.dataset.id = index;
    namesContainer.append(playerName);
}


function showVote(votesMap, document, players) {
    const hand = document.querySelector(".hand");
    const allCards = hand.querySelectorAll(".card");
    const votesByCard = {};
    for (let i = 0; i < votesMap.length; i++) {
        if (votesMap[i] == null) {
            continue;
        }
        const key = votesMap[i].toString();
        const arr = votesByCard[key];
        if (arr) {
            arr.push(i);
        } else {
            votesByCard[key] = [i];
        }
    }
    console.log(votesByCard);
    for (const card of allCards) {
        let voteContainer = card.querySelector(".player-guess-container");
        if (!voteContainer) {
            voteContainer = document.createElement("div");
            voteContainer.classList.add("player-guess-container");
            card.appendChild(voteContainer);
        } else {
            voteContainer.replaceChildren();
        }
        const cardId = card.dataset.card;
        const playerIds = votesByCard[cardId];
        if (!playerIds) {
            continue;
        }
        for (const playerId of playerIds) {
            const player = players[playerId];
            addVote(player.getName(), voteContainer, playerId);
        }
    }
}

export default {
    showVote,
    colorizeDealerCard,
};
