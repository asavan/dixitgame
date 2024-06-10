
import RoundStage from "./constants.js";
import {hide, mimic, guess} from "./phases.js";

function round(dataRound, logger, handlers) {
    const {players, storyteller, settings, stage} = {...dataRound};
    const nextMapper = {
        [RoundStage.BEGIN_ROUND]: hide,
        [RoundStage.HIDE]: mimic,
        [RoundStage.MIMIC]: guess
    };

    let curState = nextMapper[stage](Object.assign({}, settings, {players, storyteller}));
    const tryMove = async (data) => {
        const {playerIndex, state, card} = {...data};
        logger.log("tryMove", playerIndex, state, card);
        if (!curState.canMove(data)) {
            return false;
        }
        curState.moveInner(data);
        await handlers.call("move", data);
        // animation
        if (curState.isReady()) {
            const countedState = curState.toJson();
            curState = nextMapper[curState.getRoundState()](countedState);
            await handlers.call("changeState", curState.toJson());
        }
        return true;
    };

    return {
        tryMove
    };
}


export default {
    round
};
