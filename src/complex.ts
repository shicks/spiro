const {atan2, cos, hypot, sin, PI: π} = Math;

const RE = Symbol('re');
const IM = Symbol('im');
const INSTANCE = Symbol('instanceof C');
Object.defineProperties(Number.prototype, {
  [RE]: {get() { return +this; }},
  [IM]: {get() { return 0; }},
  [INSTANCE]: {value: true},
  // [re]: {get() { return +this; }},
  // [im]: {get() { return 0; }},
  // [mag]: {get() { return this < 0 ? -this : +this; }},
  // [arg]: {get() { return this < 0 ? π : 0; }},
});

declare global {
  interface Number extends C {}
}

class Rect implements C {
  readonly [RE]: number;
  readonly [IM]: number;
  constructor(re: number, im: number) {
    this[RE] = re;
    this[IM] = im;
  }
  toString() {
    return `${this[RE]} + ${this[IM]}ı`;
  }
}
Object.defineProperties(Rect.prototype, {[INSTANCE]: {value: true}});

export interface C {
  readonly [RE]: number;
  readonly [IM]: number;
  // readonly [re]: number;
  // readonly [im]: number;
  // readonly [mag]: number;
  // readonly [arg]: number;
}

export namespace C {
  export function rect(re: number, im: number): C {
    return im ? new Rect(re, im) : re;
  }
  export function re(z: C): number {
    return z[RE];
  }
  export function im(z: C): number {
    return z[IM];
  }
  export function mag(z: C): number {
    return hypot(z[RE], z[IM]);
  }
  export function mag2(z: C): number {
    return z[RE] * z[RE] + z[IM] * z[IM];
  }
  export function arg(z: C): number {
    return atan2(z[IM], z[RE]);
  }
  export function add(...zs: C[]): C {
    let re = 0;
    let im = 0;
    for (const z of zs) {
      re += z[RE];
      im += z[IM];
    }
    return rect(re, im);
  }
  export function mul(...zs: C[]): C {
    // If the underlying terms are non-rectangular, we may do
    // better keeping the results in polar?
    let re = 1;
    let im = 0;
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
    return rect(re, im);
  }
  export function conj(z: C): C {
    return rect(z[RE], -z[IM]);
  }
  export function inv(z: C): C {
    const r = mag(z);
    if (!r) return Infinity;
    // NOTE: dividing by r twice decreases the chance of overflow
    return rect(z[RE] / r / r, -z[IM] / r / r);
  }
  export function sub(z1: C, z2: C): C {
    return rect(z1[RE] - z2[RE], z1[IM] - z2[IM]);
  }
  export function div(z1: C, z2: C): C {
    const s = 1 / mag(z2);
    return mul(z1, conj(z2), s, s);
  }
  export function exp(z: C): C {
    const r = Math.exp(z[RE]);
    return rect(r * cos(z[IM]), r * sin(z[IM]));
  }
  export function log(z: C): C {
    return rect(Math.log(mag(z)), arg(z));
  }
  export function pow(a: C, b: C): C {
    return exp(mul(log(a), b));
  }
  export const I = rect(0, 1);
}
Object.defineProperties(C, {
  [Symbol.hasInstance]: {
    value: (x: unknown) => x != null && (x as any)[INSTANCE],
  },
});

export const ı = C.I;
export const I = C.I;
export const re = C.re;
export const im = C.im;
export const mag = C.mag;
export const mag2 = C.mag2;
export const arg = C.arg;
export const conj = C.conj;
export const add = C.add;
export const mul = C.mul;
export const sub = C.sub;
export const div = C.div;
export const exp = C.exp;

// NOTE: treating numbers as implicitly C makes it easier to
// accidentally treat complex numbers as primitives and add/negate
// them, e.g. C.add(C.I, -C.I) which is NaN because C.I is an object.
// Without proper operator overloading, it may just be a little too
// uncanny.


// export abstract class Complex {
//   readonly [re]: number;
//   readonly [im]: number;
//   readonly [mag]: number;
//   readonly [arg]: number;

//   readonly conj: Complex;
//   plus(...z: Z[]): Complex;
//   mul(...z: Z[]): Complex;

// }

// export namespace Z {
//   export function re(z: Z): number {
//     return z instanceof number ? z : z.re;
//   }
//   export function add(...z: Z[]): Z {
    
//   }
//   export function mul(...z: Z[]): Z;
  
// }

// // namespace Number.prototype {
  
// // }

// //type Z = C|number;

// // export class C {

// //   static rect(a: number, b: number): C {
// //     if (!a && !b) return C.ZERO;
// //     return new C(hypot(a, b), atan2(b, a));
// //   }
// //   static polar(r: number, θ: number): C {
// //     if (!r) return C.ZERO;
// //     return new C(r, θ);
// //   }

// //   readonly static I = new C(1, π/2);
// //   readonly static ONE = new C(1, 0);
// //   readonly static ZERO = new C(0, 0);

// //   constructor(readonly r: number, readonly θ: number) {}

// //   get re(): number {
// //     return this.r * cos(this.θ);
// //   }

// //   get im(): number {
// //     return this.r * sin(this.θ);
// //   }

// //   plus(...zs: Z[]): C {
// //     let a = this.re;
// //     let b = this.im;
// //     for (let z of zs) {
// //       if (typeof z === 'number') {
// //         a += z;
// //       } else {
// //         a += z.re;
// //         b += z.im;
// //       }
// //     }
// //     return C.rect(a, b);
// //   }

// //   mul(...zs: Z[]): C {
// //     let r = this.r;
// //     let θ = this.θ;
// //     for (const z of zs) {
// //       r *= z.r;
// //       θ += z.θ;
// //     }
// //     return C.polar(r, θ);
// //   }

// //   get conj(): C {
// //     return this.θ && this.θ !== π ? new C(this.r, -this.θ) : this;
// //   }

// // }

// export const ı = C.I;
