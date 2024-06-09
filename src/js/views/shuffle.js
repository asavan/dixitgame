import {drawBack} from "./basic_views.js";
import {delay} from "../utils/timer.js";
import randomFunc from "../utils/random.js";

async function shuffle(backCont, backOld, settings) {

    const movingCards = [];
    for (let i = 0; i < Math.min(length, settings.shuffleMaxCardsShow); ++i) {
        const backClone = drawBack(document);
        backClone.classList.add("absolute", "above", "long-animation");
        backCont.insertBefore(backClone, backOld);
        movingCards.push(backClone);
    }

    const randDiff = (size) => randomFunc.randomInteger(-size, size, Math.random);
    const betweenCardMove = () => delay(settings.shuffleSmallDelay* Math.random());
    await betweenCardMove();
    for (let k = 0; k < settings.shuffleTimes; ++k) {
        for (const elem of movingCards) {
            elem.style.setProperty("--dx", randDiff(150));
            elem.style.setProperty("--dy", randDiff(170));
            elem.classList.add("slide");
            await betweenCardMove();
        }
        await delay(settings.shuffleOutDelay);
        for (const elem of movingCards) {
            elem.classList.remove("slide");
            await betweenCardMove();
        }
        await delay(settings.shuffleInDelay);
    }
    await delay(settings.shuffleWaitDelay);
    for (const elem of movingCards) {
        elem.remove();
    }
}

export default shuffle;
