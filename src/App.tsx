import * as React from 'react';
import './App.css';
import { Curve, SimpleSpirograph } from './spiro';
import { Complex } from './complex';

interface SpirographProps {
  readonly curve: Curve;
  readonly start: number;
  readonly end: number;
  readonly color?: string;
}
class Spirograph extends React.Component<SpirographProps> {
  ctx: CanvasRenderingContext2D|undefined = undefined;
  render() {
    return (<canvas ref={(c) => this.ctx = c?.getContext('2d') ?? undefined}/>);
  }
  componentDidMount() {
    const ctx = this.ctx;
    if (!ctx) throw new Error(`missing context`);
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.strokeStyle = this.props.color || 'blue';
    const c = this.props.curve;
    const ds = 0.5;
    const dt = 1e-4;
    let t = this.props.start;
    let ft = c.value(t);
    ctx.moveTo(ft.real, ft.imag);
    while (t < this.props.end) {
      console.log(`Evaluating ${t}`);
      let dfdt = c.value(t + dt).sub(ft).mag / dt;
      t = Math.min(this.props.end, t + ds / dfdt);
      ft = c.value(t);
      ctx.lineTo(ft.real, ft.imag);
    }
    ctx.stroke();
  }
}

export class App extends React.Component {
  render() {
    const curve = new SimpleSpirograph();
    Object.assign(curve, {
      outerCenter: Complex.rect(100, 100),
      outerRadius: 100,
      gearRadius: 70,
      penOffset: Complex.rect(60, 0),
    });
    return <Spirograph curve={curve} start={0} end={100}/>;
  }
}
