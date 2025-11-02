export function drawCard2(p, cardItem, urlGen) {
    const cardClone = cardItem.content.cloneNode(true).firstElementChild;
    cardClone.dataset.card = p;
    const img = cardClone.querySelector("img");
    img.src = urlGen.getUrl(p);
    return cardClone;
}
