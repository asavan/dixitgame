export function drawBlank(document) {
    const blank = document.createElement("li");
    blank.classList.add("blank");
    return blank;
}

export function drawBack(document) {
    const backItem = document.querySelector("#back");
    const backClone = backItem.content.cloneNode(true).firstElementChild;
    return backClone;
}

export function repaintCard(p, cardEl) {
    cardEl.style.setProperty("--sprite-x", (1400 - (p%14)*100) + "%");
    cardEl.style.setProperty("--sprite-y", (800 - Math.floor(p/14)*100) + "%");
    cardEl.dataset.card = p;
    return cardEl;
}

export function drawCard(p, cardItem) {
    const cardClone = cardItem.content.cloneNode(true).firstElementChild;
    return repaintCard(p, cardClone);
}

export function drawCard2(p, cardItem, urlGen) {
    const cardClone = cardItem.content.cloneNode(true).firstElementChild;
    cardClone.dataset.card = p;
    const img = cardClone.querySelector("img");
    img.src = urlGen.getUrl(p);
    return cardClone;
}
