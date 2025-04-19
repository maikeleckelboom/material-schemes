import {MATERIAL_COLOR_ROLES} from "../constants";
import type {Color} from "./theme.ts";
import type {KebabCase} from "type-fest";

/** --- existing core types --- */
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
 * A modifier that takes & returns a (possibly extended) scheme.
 */
export type ModifyFn<
  V extends boolean = false,
  R = ColorSchemeReturnType<V> & Partial<CSSColorScheme>
> = (scheme: ColorSchemeReturnType<V>) => R;

/**
 * Infer the correct signature for your modifier.
 * (Mostly useful if you allow arbitrary functions here.)
 */
export type InferModifierFn<
  V extends boolean,
  F
> = F extends ModifyFn<V, infer R> ? (scheme: ColorSchemeReturnType<V>) => R : never;

export interface ColorSchemeOptions<
  V extends boolean = false
> {
  /** true = force dark mode */
  dark?: boolean;

  /** palette: true = full tones; or pass specific tone indices */
  paletteTones?: boolean | number[];

  /** if true, returns full light+dark merged scheme */
  brightnessVariants?: V;

  /** tweak the generated scheme */
  modifyColorScheme?: InferModifierFn<V, ModifyFn<V>>;
}

export type toCSSVarOptions = {
  /** CSS selector under which to emit vars */
  selector?: string;
};

