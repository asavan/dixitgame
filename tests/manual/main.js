function main() {
    console.log("dada");
    const box = document.querySelector(".circle-wrapper");
    const N = 30;
    for (let i = 0; i < N; ++i) {
        const elem = document.createElement("li");
        const pathPercent = i*100/(N-1);
        elem.style.setProperty("--path-pc", pathPercent);
        elem.classList.add("circle");
        if ((i+1)%5 === 0) {
            const pileElem = document.createElement("div");
            pileElem.textContent = (i+1);
            pileElem.classList.add("card-count");
            elem.appendChild(pileElem);
        }
        box.appendChild(elem);

    }
};

main();
