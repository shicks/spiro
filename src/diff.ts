

// TODO - what about composability?
//   - can we make a generic Fun that can be applied?

interface Vec<X extends number, Y extends number> {
  readonly cols: X;
  readonly rows: Y;
  readonly zero: boolean;
  readonly const: boolean;
  term(y: number, x: number, t: number): number;
  scale(s: Num): Vec<X, Y>;
  add(v: Vec<X, Y>, s?: Num): Vec<X, Y>;
  mul<Z extends number>(v: Vec<Z, X>): Vec<Z, Y>;
  transpose(): Vec<Y, X>;
  diff(): Vec<X, Y>;
}

type Num = Vec<1, 1>;
class ConstantScalar implements Num {
  constructor(readonly value: number) {}
  get rows() { return 1 as const; }
  get cols() { return 1 as const; }
  get zero() { return !this.value; }
  get const() { return true; }
  term() { return this.value; }
  scale(s: Num): Num {
    return s.const ?
        constantScalar(s.term(0, 0, 0) * this.value) :
        s.scale(this);
  }
  add(v: Num, s?: Num): Num {
    if (v.zero || s?.zero) return this;
    return v.const && (!s || s.const) ?
        constantScalar(this.value + v.term(0, 0, 0) * (s ? s.term(0, 0, 0) : 1)) :
        (s ? v.scale(s) : v).add(this);
  }
  mul<S extends number>(v: Vec<S, 1>): Vec<S, 1> {
    if (v.zero) return v;
    if (v.const && v.cols === 1) return constantScalar(this.value * v.term(0, 0, 0));
    return v.scale(this);
  }
  transpose(): ConstantScalar {
    return this;
  }
  diff(): Zero<1, 1> {
    return SCALAR_ZERO;
  }
}
function constantScalar(x: number): Num {
  if (!x) return SCALAR_ZERO;
  return new ConstantScalar(x);
}
class Zero<X extends number, Y extends number> implements Vec<X, Y> {
  constructor(readonly cols: X, readonly rows: Y) {}
  get zero() { return true; }
  get const() { return true; }
  term() { return 0; }
  scale(): Vec<X, Y> { return this; }
  add(v: Vec<X, Y>, s?: Num): Vec<X, Y> {
    return s ? v.scale(s) : v;
  }
  mul<Z extends number>(v: Vec<Z, X>): Vec<Z, Y> {
    return v.rows as any === this.cols ? this as any : new Zero<Z, Y>(v.cols, this.rows);
  }
  transpose(): Zero<Y, X> {
    return this.rows as any === this.cols ? this as any : new Zero(this.rows, this.cols);
  }
  diff(): Zero<X, Y> {
    return this;
  }
}

const ONE = constantScalar(1);
const SCALAR_ZERO = new Zero(1, 1);
const ORIGIN = new Zero(2, 1);

class Mul<R extends number, C extends number, S extends number> implements Vec<R, S> {
  readonly rows: R;
  readonly cols: S; // NOTE THESE ARE ALL BACKWARDS!!!
  constructor(readonly left: Vec<R, C>, readonly right: Vec<C, S>) {
    this.rows = left.rows;
    this.cols = right.cols;
  }
  get rows() { return this.left.rows; }
  get cols() { return this.right.rows; }
}

abstract class ScalarFun implements Num {
  constructor(readonly arg: Num) {}
  abstract val(t: number): number;
  get rows() { return 1 as const; }
  get cols() { return 1 as const; }
  get zero() { return false; }
  get const() { return false; }
  term(_y: number, _z: number, t: number): number {
    return this.val(t);
  }
  abstract scale(s: Num): Vec<R, C> {
    if (s.const) return constantScaled(s, this);
    return new Mul(s, this);
  }
  
}


// interface Fun<V extends Vector> {
//   value(t: numberdff): V;
//   diff(): Fun<V>;
// }
// type Vector = number|readonly number[];dfdf

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
