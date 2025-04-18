import {type DynamicColorSchemeOptions} from "../theme";

export type Color = number | string;

export interface CustomColorOptions {
  name: string;
  value: Color;
  blend?: boolean;
}

export type MaterialThemeOptions = DynamicColorSchemeOptions & {
  customColors?: CustomColorOptions[];
};
