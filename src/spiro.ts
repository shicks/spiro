import { Complex } from './complex';
import { minimize } from './golden';

export interface Curve {
  value(t: number): Complex;
}

// A simple spirograph curve made by a circular gear inside a circular frame.
export class SimpleSpirograph implements Curve {
  outerRadius: number = 10;
  gearRadius: number = 2;
  outerCenter: Complex = Complex.rect(0, 0);
  gearStart: number = 0; // +x axis
  penOffset: Complex = Complex.rect(1, 1);

  value(t: number): Complex {
    const pen = this.penOffset.mul(Complex.polar(1, -t));
    const gearCenter = Complex.polar(
      this.outerRadius - this.gearRadius,
      this.gearStart + t * this.gearRadius / this.outerRadius);
    return this.outerCenter.add(pen, gearCenter);
  }
}

export function reverse(curve: Curve, pos: Complex, t0: number, t1: number): number {
  function distance(t: number): number {
    return curve.value(t).sub(pos).mag2;
  }
  return minimize(distance, {a: t0, b: t0 + (t1 - t0) / 100});
}

// TODO - pull this into react and draw a pattern.
// Also do some testing of the reverse function.
