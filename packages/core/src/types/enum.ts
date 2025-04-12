/**
 * Represents an instance of an enum-like class
 */
export interface EnumLikeInstance<T extends string> {
  readonly name: T;
  readonly ordinal: number;
}
