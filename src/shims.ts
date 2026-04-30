// Shim for DOMMatrix which is missing in Cloudflare Workers but required by some PDF libraries
if (typeof globalThis.DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true;
    isIdentity = true;

    constructor(init?: string | number[]) {
      if (Array.isArray(init) && init.length >= 6) {
        this.a = init[0]; this.b = init[1]; this.c = init[2];
        this.d = init[3]; this.e = init[4]; this.f = init[5];
      }
    }

    static fromMatrix(other: any) {
      return new DOMMatrix([other.a, other.b, other.c, other.d, other.e, other.f]);
    }

    multiply(other: any) { return this; }
    translate(x: number, y: number, z: number = 0) { return this; }
    scale(x: number, y?: number, z: number = 1) { return this; }
    rotate(angle: number) { return this; }
    inverse() { return this; }
    toString() { return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`; }
  };
}

// Shim for navigator which is partially missing in Cloudflare Workers but required by pdf.js
const nav = (globalThis as any).navigator || {};
try { if (!nav.userAgent) Object.defineProperty(nav, 'userAgent', { value: 'Cloudflare-Worker' }); } catch (e) {}
try { if (!nav.platform) Object.defineProperty(nav, 'platform', { value: 'Linux' }); } catch (e) {}
try { (globalThis as any).navigator = nav; } catch (e) {}

// Shim for process which is required by pdf.js to detect Node environment and disable workers
if (typeof (globalThis as any).process === 'undefined') {
  (globalThis as any).process = {
    toString: () => '[object process]',
    versions: { node: '20.0.0' }
  };
}

export {};
