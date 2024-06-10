import {drawCard} from "./basic_views.js";

export default function chooseCard(document, card) {
    return new Promise((resolve, reject) => {
        const cardItem = document.querySelector("#card");
        const box = document.querySelector(".color-picker-holder");
        box.replaceChildren();
        const places = document.createElement("ul");
        places.classList.add("color-grid");
        box.appendChild(places);
        const colorItem = drawCard(card, cardItem);
        colorItem.classList.add("main-card");
        colorItem.classList.remove("sprite-container");
        colorItem.addEventListener("click", e => {
            e.preventDefault();
            box.replaceChildren();
            resolve(card);
        });
        places.appendChild(colorItem);
        const cancel = document.createElement("li");
        cancel.classList.add("cancel-color");

        cancel.addEventListener("click", e => {
            e.preventDefault();
            box.replaceChildren();
            reject();
        });
        places.appendChild(cancel);
    });
}
