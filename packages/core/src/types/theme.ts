import {type PaletteStyle, type PaletteStyleName} from "../theme";

export type Color = number | string;

export interface ExtendedColor {
  name: string;
  value: Color;
  blend?: boolean;
}

export interface DynamicColorSchemeOptions {
  /** Seed color for scheme generation (alternative to primary) */
  sourceColor?: Color;
  /** Primary color override (alternative to sourceColor) */
  primary?: Color;
  /** Secondary color override */
  secondary?: Color;
  /** Tertiary color override */
  tertiary?: Color;
  /** Neutral background color override */
  neutral?: Color;
  /** Neutral variant color override */
  neutralVariant?: Color;
  /** Visual style variant (default: TonalSpot) */
  style?: PaletteStyle | (PaletteStyleName | (string & {}));
  /** Contrast adjustment (0-1, default: 0) */
  contrastLevel?: number;
  /** Dark mode flag (default: false) */
  isDark?: boolean;
}

export type MaterialThemeOptions = DynamicColorSchemeOptions & {
  customColors?: ExtendedColor[];
};

