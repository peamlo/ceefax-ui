export interface MosaicOptions {
  /** Use the separated characters (U+1CE51–1CE8F) instead of the contiguous ones. */
  separated?: boolean;
}
/** One block sum (0–63) → its character; 0 is a space. */
export function cell(bits: number, options?: MosaicOptions): string;
/** Rows of pixels (`#` lit, anything else off) → mosaic text, one line per three rows. */
export function toMosaic(pixels: readonly string[], options?: MosaicOptions): string;
