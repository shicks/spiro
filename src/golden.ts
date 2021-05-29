// Implements golden section search

const φ = (1 + Math.sqrt(5)) / 2;  // 1.618
const φ1 = φ - 1;  // 0.618
const φ2 = 1 - φ1;  // 0.382

interface MinimizeParams {
  a: number;
  b: number;
  c?: number;
  tol?: number;
  //glimit?: number;
}

const glimit = 10;
export function minimize(f: (x: number) => number,
                         {a, b, c = undefined!,
                          tol = 1e-8}: MinimizeParams): number {
  let fa = f(a);
  let fb = f(b);
  let fc!: number;

  // Returns true if bracketing succeeded
  function bracket(): boolean {
    // Start by finding the downhill direction.  Assume f(b) < f(a).
    if (fa < fb) [a, b, fa, fb] = [b, a, fb, fa];
    // Make a first guess for c: b + φ(b-a).
    c = b + φ * (b - a); fc = f(c);
    while (fb > fc) {
      // Attempt a parabolic extrapolation.
      const r = (b - a) * (fb - fc);
      const q = (b - c) * (fb - fa);
      let denom = 2 * (q - r);
      // Prevent dividing by zero.
      denom = denom < 0 ? Math.min(-1e-20, denom) : Math.max(1e-20, denom);
      let u = b - ((b - c) * q - (b - a) * r) / denom;
      const ulim = b + glimit * (c - b); // Parabolic extrapolation limit
      let fu!: number;
      // Try various possibilities
      if ((b - u) * (u - c) > 0) { // Parabolic u is between b and c: try it
        fu = f(u);
        if (fu < fc) { // Minimum u between b and c
          a = b;
          b = u;
          fa = fb;
          fb = fu;
          return true;
        } else if (fu > fb) { // Minimum b between a and u
          c = u;
          fc = fu;
          return true;
        }
        // Parabolic fit was no use, use default magnification
        u = c + φ * (c - b); fu = f(u);
      } else if ((c - u) * (u - ulim) > 0) { // Parabolic u between c and limit
        fu = f(u);
        if (fu < fc) {
          b = c; fb = fc;
          c = u; fc = fu;
          u = c + φ * (c - b); fu = f(u);
        }
      } else if ((u - ulim) * (ulim - c) >= 0) { // Limit extrapolation
        u = ulim; fu = f(u);
      } else { // Reject parabolic u, use default φ
        u = c + φ * (c - b); fu = f(u);
      }
      // Either way, replace a,b,c with b,c,u before repeating search
      a = b; fa = fb;
      b = c; fb = fc;
      c = u; fc = fu;
    }
    return true; // bracketed
  }

  // Actually do the search.
  if (c == null) {
    bracket();
  // } else {
  //   fc = f(c);
  }

  let x1: number, x2: number, f1: number, f2: number;
  if (Math.abs(c - b) > Math.abs(b - a)) {
    x1 = b;
    f1 = fb;
    x2 = b + φ2 * (c - b);
    f2 = f(x2);
  } else {
    x2 = b;
    f2 = fb;
    x1 = b - φ2 * (b - a);
    f1 = f(x1);
  }
  while (Math.abs(c - a) > tol * (Math.abs(x1) + Math.abs(x2))) {
    if (f2 < f1) {
      a = x1;
      x1 = x2;
      x2 = φ1 * x1 + φ2 * c;
      f1 = f2;
      f2 = f(x2);
    } else {
      c = x2;
      x2 = x1;
      x1 = φ1 * x2 + φ2 * a;
      f2 = f1;
      f1 = f(x1);
    }
  }
  return f1 < f2 ? x1 : x2;
}



// // Given a function `f` and distinct abscissae `a` and `b`, returns a
// // local minimum in the downhill direction.  An optional `domain` allows
// // constraining the search to a finite domain.  If the endpoint of the
// // specified domain is a local endpoint minimum, it will be returned.
// export function minimize(f: (x: number) => number, a: number, b: number,
//                          domain?: [number, number]): number {
//   domain = domain || [-Infinity, Infinity];
// }
