import {MATERIAL_COLOR_ROLES} from "../constants";
import type {Color} from "./theme.ts";
import type {KebabCase} from "type-fest";

export type ColorRoleKey = (typeof MATERIAL_COLOR_ROLES)[number];

export type MaterialColorScheme = {
  [K in ColorRoleKey | string]: Color;
};

export interface ColorScheme extends MaterialColorScheme {
  // [key: string]: string | number;
}

export interface CssVariableMap extends Record<KebabCase<ColorRoleKey | string>, Color> {
  [key: `--${KebabCase<ColorRoleKey | string>}`]: string;
}

type SuffixedColorScheme<Suffix extends string> = {
  [K in ColorRoleKey as `${K}${Suffix}`]: Color;
};

export type LightColorScheme = SuffixedColorScheme<"Light">;

export type DarkColorScheme = SuffixedColorScheme<"Dark">;

/**
 * Return full ColorScheme when V=true, otherwise just the base.
 */
export type AdaptiveColorScheme<
  V extends boolean = false
> = V extends true
  ? ColorScheme & LightColorScheme & DarkColorScheme
  : ColorScheme;

/**
 * A modifier that takes and returns a (possibly extended) scheme.
 */
export type ModifyColorSchemeFn<
  V extends boolean = false,
  R = AdaptiveColorScheme<V> & Partial<ColorScheme>
> = (scheme: AdaptiveColorScheme<V>) => R;


export interface ColorSchemeConfig<V extends boolean = boolean> {
  /**
   * Palette: true = full tones; or pass specific tone indices
   */
  paletteTones?: boolean | number[];
  /**
   * Tweak the generated scheme, considering variants if present
   */
  modifyColorScheme?: ModifyColorSchemeFn<V>;
}

export interface FullColorSchemeConfig<V extends boolean = false> extends ColorSchemeConfig<V> {
  /**
   * Whether to generate light and dark color schemes
   */
  dark?: boolean;
  /**
   * Enable brightness variants (links to V generic)
   */
  brightnessVariants?: V;
}

export interface CssOutputConfig {
  /**
   * CSS selector under which to emit vars
   */
  selector?: string;
  /**
   * Minify the output
   */
  minify?: boolean;
}

export interface ColorSchemeStylesConfig<WithVariants extends boolean = false>
  extends FullColorSchemeConfig<WithVariants>, CssOutputConfig {
}
