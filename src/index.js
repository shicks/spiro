import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
const lines = [7, 7 << 3, 7 << 6, 73, 73 << 1, 73 << 2, 0x111, 0x54];
function bitOr(x, y) { return x | y; }
function calculateWinner(board) {
    for (const player of 'XO') {
        const mask = [...board].map((p, i) => p === player ? 1 << i : 0).reduce(bitOr);
        for (const line of lines) {
            if ((line & mask) === line)
                return player;
        }
    }
    return undefined;
}
class Square extends React.PureComponent {
    render() {
        return (React.createElement("button", { "data-index": this.props.index, className: "square" }, this.props.value));
    }
}
class Board extends React.PureComponent {
    renderSquare(i) {
        return (React.createElement(Square, { index: i, value: this.props.squares[i] }));
    }
    render() {
        return (React.createElement("div", null,
            React.createElement("div", { className: "board-row" },
                this.renderSquare(0),
                this.renderSquare(1),
                this.renderSquare(2)),
            React.createElement("div", { className: "board-row" },
                this.renderSquare(3),
                this.renderSquare(4),
                this.renderSquare(5)),
            React.createElement("div", { className: "board-row" },
                this.renderSquare(6),
                this.renderSquare(7),
                this.renderSquare(8))));
    }
}
function getData(target, key) {
    var _a, _b;
    const data = (_b = (_a = target.closest(`[data-${key}]`)) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b[key];
    return typeof data === 'string' ? JSON.parse(data) : null;
}
class Game extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { step: 0, history: [{ squares: '         ' }] };
        this.handleBoardClick = (e) => {
            let { step, history } = this.state;
            const current = history[step];
            let { squares, winner } = current;
            const i = getData(e.target, 'index');
            if (typeof i !== 'number')
                return;
            if (current.squares[i] !== ' ')
                return;
            if (winner)
                return;
            const squaresArray = [...current.squares];
            squaresArray[i] = 'XO'[step & 1];
            squares = squaresArray.join('');
            winner = calculateWinner(squares);
            history = [...history.slice(0, step + 1), { squares, winner }];
            step++;
            this.setState({ history, step });
        };
    }
    render() {
        const { step, history } = this.state;
        const current = history[step];
        const player = step & 1;
        let status;
        if (current.winner) {
            status = `Winner: ${current.winner}`;
        }
        else if ([...current.squares].some(x => x === ' ')) {
            status = `Next player: ${'XO'[player]}`;
        }
        else {
            status = `Draw`;
        }
        const moves = history.map((_, index) => {
            const desc = index ? `Go to move #${index}` : `Go to game start`;
            return (React.createElement("li", { key: index },
                React.createElement("button", { onClick: () => this.jumpTo(index) }, desc)));
        });
        return (React.createElement("div", { className: "game" },
            React.createElement("div", { className: "game-board", onClick: this.handleBoardClick },
                React.createElement(Board, { squares: current.squares })),
            React.createElement("div", { className: "game-info" },
                React.createElement("div", null, status),
                React.createElement("ol", null, moves))));
    }
    jumpTo(step) {
        this.setState({ history: this.state.history, step });
    }
}
// ========================================
ReactDOM.render(React.createElement(Game, null), document.getElementById('root'));
