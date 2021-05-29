



type Point = readonly [number, number];

// // A curve.
// interface Curve {
//   forward(t: number): Point;
//   reverse(p: Point, t0: number): number;
// }

// function rotate(p: Point, theta: number): Point {
//   const c = Math.cos(theta);
//   const s = Math.sin(theta);
//   return [p[0] * c - p[1] * s, p[1] * s + p[0] * c];
// }
// function add(p1: Point, p2: Point, s = 1): Point {
//   return [p1[0] + s * p2[0], p1[1] + s * p2[1]];
// }
// function dot(p1: Point, p2: Point): number {
//   return p1[0] * p2[0] + p1[1] * p2[1];
// }

// // A simple spirograph curve made by a circular gear inside a circular frame.
// export class SimpleSpirograph implements Curve {
//   outerRadius: number = 10;
//   gearRadius: number = 2;
//   outerCenter: Point = [0, 0];
//   gearStart: number = 0; // +x axis
//   penOffset: Point = [1, 1];

//   forward(t: number) {
//     // NOTE: t is an arbitrary unit, here we'll use it to measure radians
//     // for the inner gear
//     const pen = rotate(this.penOffset, -t);
//     const gearCenter = rotate([this.outerRadius - this.gearRadius, 0], this.gearStart + t * this.gearRadius / this.outerRadius);
//     return add(this.outerCenter, add(gearCenter, pen));
//   }

//   diff(t: number) {
//     // x = ocx + (oR - gR) * cos(gS + t*gR/oR) + p0x * ct + p0y * st
//     // x' = -(oR - gR) * gR/oR * sin(gS + t*gR/oR) - p0x * st + p0y * ct
//     // y = ocy + (oR - gR) * sin(gS + t*gR/oR) + p0y * ct - p0x * st
//     // y' = (oR - gR) * gR/oR * cos(gS + t*gR/oR) - p0y * st - p0x * ct
//     const 
//   }

//   reverse(p: Point, t0: number) {
//     // This is trickier.  We basically need to solve for a small theta
//     // minimizing the distance to the curve.  To do that, we need to
//     // differentiate 0 = [s^2]' = [|p - f(t)|^2]' = f(t)·f'(t) - p·f'(t)
//     //  = (x(t)-px)*x'(t) + (y(t)-py)*y'(t)
//   }
// }

// TODO - can we use automatic differentiation here?
// Newton's method would let us efficiently solve for the nearest point, but
// it requires a second derivative, which is kind of a pain...


interface Fun<V extends Vector> {
  value(t: number): V;
  diff(): Fun<V>;
}
type Vector = number|readonly number[];

// TODO - we need to do a better job eliminating known zeros...
// i.e. multiplying a Fun by a known zero should result in a known zero,
// which we can then continue to use to further trim.

// Can we make Fun implement Vector?  What if we give up using numbers directly?

function addVec<V extends Vector>(v1: V, v2: V, s = 1): V{
  if (typeof v1 === 'number') return (v1 + s * (v2 as number)) as V;
  return (v1 as readonly number[])
      .map((v: number, i: number) => v + s * (v2 as readonly number[])[i]) as any;
}
function scaleVec<V extends Vector>(value: V, s: number): V {
  return typeof value === 'number' ? value * s :
      (value as readonly number[]).map(x => x * s) as any;
}
function constant<V extends Vector>(value: V): Fun<V> {
  const zero = scaleVec(value, 0);
  return {value: () => value, diff: () => constant(zero)};
}
function polynomial<V extends Vector>(...coefficients: V[]): Fun<V> {
  return {value: (t: number) => {
    let x = t;
    let total = coefficients[0];
    for (let i = 1; i < coefficients.length; i++) {
      const c = coefficients[i];
      total = addVec(total, c, x);
      x *= t;
    }
    return total;
  }, diff: () => {
    return polynomial(...Array.from({length: coefficients.length - 1},
                                    (_, i) => scaleVec(coefficients[i + 1], i)));
  }};
}

function add<V extends Vector>(p1: Fun<V>, p2: Fun<V>): Fun<V> {
  return {
    value: (t: number) => addVec(p1.value(t), p2.value(t)),
    diff: () => add(p1.diff(), p2.diff()),
  };
}

function rotate(point: Fun<Point>, angle: Fun<number>): Fun<Point> {
  return {value: (t: number) => {
    const p = point.value(t);
    const th = angle.value(t);
    const ct = Math.cos(th);
    const st = Math.sin(th);
    return [p[0] * ct - p[1] * st, p[1] * ct + p[0] * st];
  }, diff: () => {
    return add(rotate(point.diff(), angle),
               mul(rotate(point, add(angle, constant(Math.PI / 2))),
                   angle.diff()));
  }};
}

function mul<V extends Vector>(v: Fun<V>, s: Fun<number>): Fun<V> {
  return {
    value: (t: number) => scaleVec(v.value(t), s.value(t)),
    diff: () => add(mul(v, s.diff()), mul(v.diff(), s)),
  };          
}

function dot<V extends Vector>(p1: Fun<V>, p2: Fun<V>): Fun<number> {
  
}
