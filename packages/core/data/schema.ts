import {z} from "zod";

const hexColorSchema = z.string().regex(/^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/);

const extendedColorSchema = z.object({
  name: z.string(),
  color: hexColorSchema,
  description: z.string(),
  harmonized: z.boolean(),
});

const coreColorsSchema = z.object({
  primary: hexColorSchema,
  secondary: hexColorSchema,
  tertiary: hexColorSchema,
  error: hexColorSchema,
  neutral: hexColorSchema,
  neutralVariant: hexColorSchema,
});

const schemeSchema = z.object(hexColorSchema);

const paletteSchema = z.object(hexColorSchema);

export const themeSchema = z.object({
  description: z.string(),
  seed: hexColorSchema,
  coreColors: coreColorsSchema,
  extendedColors: z.array(extendedColorSchema),
  schemes: z.object(schemeSchema),
  palettes: z.object(paletteSchema)
});

export type ThemeBuilderJSONExport = z.infer<typeof themeSchema>;


