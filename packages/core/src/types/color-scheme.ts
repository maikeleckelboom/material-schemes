import {MATERIAL_COLOR_ROLES} from "../constants";
import type {Color} from "./theme.ts";
import type {KebabCase} from "type-fest";

export type ColorRoleKey = (typeof MATERIAL_COLOR_ROLES)[number];

export interface ColorScheme extends Record<ColorRoleKey | string, Color> {
  [key: string]: Color;
}

export interface CSSColorScheme extends Record<KebabCase<ColorRoleKey | string>, Color> {
  [key: `--${KebabCase<ColorRoleKey | string>}`]: Color;
}

type SuffixedColorScheme<Suffix extends string> = {
  [K in ColorRoleKey as `${K}${Suffix}`]: Color;
};

export type LightColorScheme = SuffixedColorScheme<"Light">;

export type DarkColorScheme = SuffixedColorScheme<"Dark">;

/**
 * Return full ColorScheme when V=true, otherwise just the base.
 */
export type ColorSchemeReturnType<
  V extends boolean = false
> = V extends true
  ? ColorScheme & LightColorScheme & DarkColorScheme
  : ColorScheme;

/**
 * A modifier that takes and returns a (possibly extended) scheme.
 */
export type ModifyFn<
  V extends boolean = false,
  R = ColorSchemeReturnType<V> & Partial<CSSColorScheme>
> = (scheme: ColorSchemeReturnType<V>) => R;

export interface SchemeColorSchemeOptions {
  /** palette: true = full tones; or pass specific tone indices */
  paletteTones?: boolean | number[];
  /** tweak the generated scheme */
  modifyColorScheme?: ModifyFn;
}

export interface ThemeColorSchemeOptions {
  /** true = force dark mode */
  dark?: boolean;
  /** palette: true = full tones; or pass specific tone indices */
  paletteTones?: boolean | number[];
  /** if true, returns a full light+dark merged scheme */
  brightnessVariants?: boolean;
  /** tweak the generated scheme */
  modifyColorScheme?: ModifyFn;
}

export interface ColorSchemeOptions<V extends boolean = false> {
  /** true = force dark mode */
  dark?: boolean;
  /** palette: true = full tones; or pass specific tone indices */
  paletteTones?: boolean | number[];
  /** if true, returns the full light+dark merged scheme */
  brightnessVariants?: V;
  /** tweak the generated scheme */
  modifyColorScheme?: ModifyFn<V>;
}

export type toCSSVarOptions = {
  /** CSS selector under which to emit vars */
  selector?: string;
};

