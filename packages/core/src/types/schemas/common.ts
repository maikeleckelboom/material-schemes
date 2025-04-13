import { z } from 'zod';
import {Contrast} from "../../theme/Contrast.ts";

export const ARGB_REGEX = /^[0-9a-fA-F]{8}$/;

export const argbSchema = z.union([
  z.string().regex(ARGB_REGEX),
  z.number().int().min(0x00000000).max(0xFFFFFFFF)
]);

export const contrastLevelSchema = z.number()
  .min(Contrast.Reduced.value)
  .max(Contrast.High.value)
  .default(Contrast.Default.value);
