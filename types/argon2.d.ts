export const argon2d: number;
export const argon2i: number;
export const argon2id: number;
export const defaults: {
  hashLength: number;
  memoryCost: number;
  parallelism: number;
  saltLength: number;
  timeCost: number;
  type: number;
  version: number;
};
export function hash(plain: any, { raw, salt, ...options }?: any): any;
export const limits: {
  hashLength: {
    max: number;
    min: number;
  };
  memoryCost: {
    max: number;
    min: number;
  };
  parallelism: {
    max: number;
    min: number;
  };
  timeCost: {
    max: number;
    min: number;
  };
};
export function needsRehash(digest: any, options: any): any;
export function verify(digest: any, plain: any): any;
