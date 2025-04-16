import {describe, expect, it} from 'vitest';
import {PaletteStyle} from "../../src";

describe('PaletteStyle', () => {
  it('should have correct name and ordinal for each instance', () => {
    expect(PaletteStyle.Monochrome.name).toBe("Monochrome");
    expect(PaletteStyle.Monochrome.ordinal).toBe(0);

    expect(PaletteStyle.Neutral.name).toBe("Neutral");
    expect(PaletteStyle.Neutral.ordinal).toBe(1);

    expect(PaletteStyle.TonalSpot.name).toBe("TonalSpot");
    expect(PaletteStyle.TonalSpot.ordinal).toBe(2);

    expect(PaletteStyle.Vibrant.name).toBe("Vibrant");
    expect(PaletteStyle.Vibrant.ordinal).toBe(3);

    expect(PaletteStyle.Expressive.name).toBe("Expressive");
    expect(PaletteStyle.Expressive.ordinal).toBe(4);

    expect(PaletteStyle.Fidelity.name).toBe("Fidelity");
    expect(PaletteStyle.Fidelity.ordinal).toBe(5);

    expect(PaletteStyle.Content.name).toBe("Content");
    expect(PaletteStyle.Content.ordinal).toBe(6);

    expect(PaletteStyle.Rainbow.name).toBe("Rainbow");
    expect(PaletteStyle.Rainbow.ordinal).toBe(7);

    expect(PaletteStyle.FruitSalad.name).toBe("FruitSalad");
    expect(PaletteStyle.FruitSalad.ordinal).toBe(8);
  });

  it('should have entries in the declared order', () => {
    expect(PaletteStyle.entries).toEqual([
      PaletteStyle.Monochrome,
      PaletteStyle.Neutral,
      PaletteStyle.TonalSpot,
      PaletteStyle.Vibrant,
      PaletteStyle.Expressive,
      PaletteStyle.Fidelity,
      PaletteStyle.Content,
      PaletteStyle.Rainbow,
      PaletteStyle.FruitSalad,
    ]);
  });

  it('valueOf should return the correct PaletteStyle instance for a valid name', () => {
    expect(PaletteStyle.valueOf("Monochrome")).toBe(PaletteStyle.Monochrome);
    expect(PaletteStyle.valueOf("Neutral")).toBe(PaletteStyle.Neutral);
    expect(PaletteStyle.valueOf("TonalSpot")).toBe(PaletteStyle.TonalSpot);
    expect(PaletteStyle.valueOf("Vibrant")).toBe(PaletteStyle.Vibrant);
    expect(PaletteStyle.valueOf("Expressive")).toBe(PaletteStyle.Expressive);
    expect(PaletteStyle.valueOf("Fidelity")).toBe(PaletteStyle.Fidelity);
    expect(PaletteStyle.valueOf("Content")).toBe(PaletteStyle.Content);
    expect(PaletteStyle.valueOf("Rainbow")).toBe(PaletteStyle.Rainbow);
    expect(PaletteStyle.valueOf("FruitSalad")).toBe(PaletteStyle.FruitSalad);
  });

  it('valueOf should throw an error when given an invalid name', () => {
    expect(() => PaletteStyle.valueOf("NonExisting")).toThrowError(
      "No PaletteStyle with name 'NonExisting' found."
    );
  });
});
