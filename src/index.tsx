import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const lines = [7, 7 << 3, 7 << 6, 73, 73 << 1, 73 << 2, 0x111, 0x54];

function bitOr(x: number, y: number) { return x | y; }

function calculateWinner(board: string): string|undefined {
  for (const player of 'XO') {
    const mask = [...board].map((p, i) => p === player ? 1 << i : 0).reduce(bitOr);
    for (const line of lines) {
      if ((line & mask) === line) return player;
    }
  }
  return undefined;
}

interface SquareProps {
  readonly index: number;
  readonly value: string|null;
}
class Square extends React.PureComponent<SquareProps> {
  render() {
    return (
      <button
        data-index={this.props.index}
        className="square"
      >
        {this.props.value}
      </button>
    );
  }
}

interface BoardProps {
  readonly squares: string;
}
class Board extends React.PureComponent<BoardProps> {
  renderSquare(i: number) {
    return (
      <Square
        index={i}
        value={this.props.squares[i]}
      />);
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

function getData(target: EventTarget, key: string): object|boolean|number|string|null {
  const data =
      ((target as Element).closest(`[data-${key}]`) as HTMLElement)?.dataset?.[key];
  return typeof data === 'string' ? JSON.parse(data) : null;
}

interface HistoryItem extends BoardProps {
  readonly winner?: string;
}

interface GameState {
  readonly history: readonly HistoryItem[];
  readonly step: number;
}

class Game extends React.Component<{}, GameState> {
  state: GameState = {step: 0, history: [{squares: '         '}]};

  render() {
    const {step, history} = this.state;
    const current = history[step];
    const player = step & 1;
    let status;
    if (current.winner) {
      status = `Winner: ${current.winner}`;
    } else if ([...current.squares].some(x => x === ' ')) {
      status = `Next player: ${'XO'[player]}`;
    } else {
      status = `Draw`;
    }
    const moves = history.map((_, index) => {
      const desc = index ? `Go to move #${index}` : `Go to game start`;
      return (
        <li key={index}><button onClick={() => this.jumpTo(index)}>{desc}</button></li>
      );
    });

    return (
      <div className="game">
        <div className="game-board" onClick={this.handleBoardClick}>
          <Board squares={current.squares}/>
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }

  jumpTo(step: number) {
    this.setState({history: this.state.history, step});
  }

  handleBoardClick = (e: React.MouseEvent) => {
    let {step, history} = this.state;
    const current = history[step];
    let {squares, winner} = current;
    const i = getData(e.target, 'index');
    if (typeof i !== 'number') return;
    if (current.squares[i] !== ' ') return;
    if (winner) return;
    const squaresArray = [...current.squares];
    squaresArray[i] = 'XO'[step & 1];
    squares = squaresArray.join('');
    winner = calculateWinner(squares);
    history = [...history.slice(0, step + 1), {squares, winner}];
    step++;
    this.setState({history, step});
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
