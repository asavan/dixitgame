
export default function viewActions(presenter) {
    return {
        "move": presenter.onMove,
        "changeState": presenter.onChangeState,
        "shuffle": presenter.onShuffle,
        "newround": presenter.onNewRound,
        "roundover": presenter.onRoundEnd,
        "gameover": presenter.onGameOver,
        "deal": presenter.onDeal
    };
}
