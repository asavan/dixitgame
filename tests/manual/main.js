function main() {
    const box = document.querySelector(".circle-wrapper");
    const N = 30;
    for (let i = 0; i < N; ++i) {
        const elem = document.createElement("li");
        const pathPercent = i*100/(N-1);
        elem.style.setProperty("--path-pc", pathPercent);
        elem.classList.add("circle");
        if ((i+1)%5 === 0) {
            elem.classList.add("big");
            const pileElem = document.createElement("div");
            pileElem.textContent = (i+1);
            pileElem.classList.add("card-count");
            elem.appendChild(pileElem);
        }

        if (i === 12) {
            const anchorName = "--anchor-el";
            // elem.style.setProperty("anchor-name", anchorName);
        }

        box.appendChild(elem);
    }

    for (const i of [4]) {
        const pileElem = document.createElement("li");
        pileElem.classList.add("anchored-notice");
        pileElem.textContent = "sasha" + (i+1);
        box.appendChild(pileElem);
    }
};

main();
