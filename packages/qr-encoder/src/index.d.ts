export type ErrorCorrection = "low" | "medium" | "quartile" | "high";

export declare const KIND: {
  readonly Data: 0;
  readonly FinderRing: 1;
  readonly FinderGap: 2;
  readonly FinderEye: 3;
  readonly Separator: 4;
  readonly AlignmentRing: 5;
  readonly AlignmentGap: 6;
  readonly AlignmentEye: 7;
  readonly Timing: 8;
  readonly Format: 9;
  readonly Version: 10;
  readonly DarkModule: 11;
};

export type EncodeOpts = {
  ecc?: ErrorCorrection;
  version?: number;
  minVersion?: number;
  mask?: number;
  boostEcc?: boolean;
};

export type EncodedSymbol = {
  size: number;
  version: number;
  mask: number;
  ecc: ErrorCorrection;
  modules: Uint8Array;
  kinds: Uint8Array;
};

export declare function encodeSymbol(text: string, opts?: EncodeOpts): EncodedSymbol;
