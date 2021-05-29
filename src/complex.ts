const {atan2, cos, hypot, sin, PI: π} = Math;

const RE = Symbol('re');
const IM = Symbol('im');

Object.defineProperties(Number.prototype, {
  [RE]: {get() { return +this; }},
  [IM]: {get() { return 0; }},
});
declare global {
  interface Number {
    readonly [RE]: number;
    readonly [IM]: number;
  }
}

export type C = Complex|number;

export class Complex {
  readonly [RE]: number;
  readonly [IM]: number;
  constructor(re: number, im: number) {
    this[RE] = re;
    this[IM] = im;
  }

  static of(z: C, im: number = 0): Complex {
    return typeof z === 'number' ? new Complex(z, im) :
        im ? new Complex(z[RE], z[IM] + im) : z;
  }

  static rect(re: number, im: number): Complex {
    return new Complex(re, im);
  }

  static polar(mag: number, arg: number): Complex {
    return new Complex(mag * cos(arg), mag * sin(arg));
  }

  toString() {
    return `${this[RE]} + ${this[IM]}ı`;
  }

  get real(): number { return this[RE]; }
  get imag(): number { return this[IM]; }

  get mag(): number { return hypot(this[RE], this[IM]); }
  get mag2(): number { return this[RE] * this[RE] + this[IM] * this[IM]; }
  get arg(): number { return atan2(this[IM], this[RE]); }

  get conj(): Complex {
    return this[IM] ? new Complex(this[RE], -this[IM]) : this;
  }
  get neg(): Complex {
    return new Complex(-this[RE], -this[IM]);
  }
  get recip(): Complex {
    const r = this.mag;
    if (!r) return new Complex(Infinity, 0); // direction?
    // NOTE: dividing by r twice decreases the chance of overflow
    return new Complex(this[RE] / r / r, -this[IM] / r / r);
  }

  add(...zs: C[]): Complex {
    let re = this[RE];
    let im = this[IM];
    for (const z of zs) {
      re += z[RE];
      im += z[IM];
    }
    return new Complex(re, im);
  }

  mul(...zs: C[]): Complex {
    // If the underlying terms are non-rectangular, we may do
    // better keeping the results in polar?
    let re = this[RE];
    let im = this[IM];
    for (const z of zs) {
      if (typeof z === 'number') {
        re *= z;
        im *= z;
      } else {
        // need to store temporary to avoid messing up im computation
        const newRe = re * z[RE] - im * z[IM];
        im = re * z[IM] + im * z[RE];
        re = newRe;
      }
    }
    return new Complex(re, im);
  }

  sub(z: C): Complex {
    return new Complex(this[RE] - z[RE], this[IM] - z[IM]);
  }

  div(z: C): Complex {
    if (typeof z === 'number') return new Complex(this[RE] / z, this[IM] / z);
    const r = z.mag;
    const re = (this[RE] / r) * (z[RE] / r) + (this[IM] / r) * (z[IM] / r);
    const im = (this[IM] / r) * (z[RE] / r) - (this[RE] / r) * (z[IM] / r);
    return new Complex(re, im);
  }

  exp(): Complex {
    const r = Math.exp(this[RE]);
    return new Complex(r * cos(this[IM]), r * sin(this[IM]));
  }

  log(): Complex {
    return new Complex(Math.log(this.mag), this.arg);
  }

  pow(z: C): Complex {
    return this.log().mul(z).exp();
  }

  static readonly I = new Complex(0, 1);
}
