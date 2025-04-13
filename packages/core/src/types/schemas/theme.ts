import {z} from 'zod';
import {PaletteStyle} from '../../theme/PaletteStyle';

export const paletteStyleSchema = z.union([
  z.string().transform(val => PaletteStyle.fromName(val)),
  z.number().int().min(0).max(8).transform(val => PaletteStyle.fromVariant(val).value),
]).transform(value => {
  if (value instanceof PaletteStyle) return value;
  throw new Error('Invalid palette style');
});
