
let votesMap = [];
const myIndex = 2;
const dealer = 0;
const cards = [58, 63, 33];
votesMap[1] = 33;
votesMap[2] = 63;
const myCard = cards[myIndex];
console.log(votesMap);
const str = JSON.stringify(votesMap);
console.log(str);
votesMap = JSON.parse(str);
console.log(votesMap);
const hand = document.querySelector(".hand");
const cardEl = hand.querySelector(`[data-card="${myCard}"]`);

function colorizeDealerCard(dealer, cards) {
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

const namesContainer = document.createElement("div");
namesContainer.classList.add("player-guess-container");
cardEl.appendChild(namesContainer);

function addVote(index, name) {
    const name1 = document.createElement("div");
    name1.classList.add("player-guess");
    name1.textContent = name;
    namesContainer.append(name1);
}

function addVote1(index, name, size) {
    const name1 = document.createElement("div");
    const position = Math.floor(100 / size * index);
    name1.style.setProperty("--top-position", position + "%");
    name1.classList.add("player-guess", "reveal");
    name1.textContent = name;
    cardEl.append(name1);
}

addVote(0, "sasha", 6);
addVote(2, "player1", 6);
addVote(1, "player2", 6);
addVote(3, "player3", 6);
addVote1(4, "player4", 6);

console.log(cardEl);

colorizeDealerCard(dealer, cards);