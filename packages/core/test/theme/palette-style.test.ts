import {describe, expect, it} from 'vitest';
import {PaletteStyle} from "../../src";

describe('PaletteStyle', () => {
  it('should have correct name and value for each instance', () => {
    expect(PaletteStyle.Monochrome.name).toBe("Monochrome");
    expect(PaletteStyle.Monochrome.value).toBe(0);

    expect(PaletteStyle.Neutral.name).toBe("Neutral");
    expect(PaletteStyle.Neutral.value).toBe(1);

    expect(PaletteStyle.TonalSpot.name).toBe("TonalSpot");
    expect(PaletteStyle.TonalSpot.value).toBe(2);

    expect(PaletteStyle.Vibrant.name).toBe("Vibrant");
    expect(PaletteStyle.Vibrant.value).toBe(3);

    expect(PaletteStyle.Expressive.name).toBe("Expressive");
    expect(PaletteStyle.Expressive.value).toBe(4);

    expect(PaletteStyle.Fidelity.name).toBe("Fidelity");
    expect(PaletteStyle.Fidelity.value).toBe(5);

    expect(PaletteStyle.Content.name).toBe("Content");
    expect(PaletteStyle.Content.value).toBe(6);

    expect(PaletteStyle.Rainbow.name).toBe("Rainbow");
    expect(PaletteStyle.Rainbow.value).toBe(7);

    expect(PaletteStyle.FruitSalad.name).toBe("FruitSalad");
    expect(PaletteStyle.FruitSalad.value).toBe(8);
  });

  it('should have Values in the declared order', () => {
    expect(PaletteStyle.Values).toEqual([
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

  it('from should return the correct PaletteStyle instance for a valid name', () => {
    expect(PaletteStyle.from("Monochrome")).toBe(PaletteStyle.Monochrome);
    expect(PaletteStyle.from("Neutral")).toBe(PaletteStyle.Neutral);
    expect(PaletteStyle.from("TonalSpot")).toBe(PaletteStyle.TonalSpot);
    expect(PaletteStyle.from("Vibrant")).toBe(PaletteStyle.Vibrant);
    expect(PaletteStyle.from("Expressive")).toBe(PaletteStyle.Expressive);
    expect(PaletteStyle.from("Fidelity")).toBe(PaletteStyle.Fidelity);
    expect(PaletteStyle.from("Content")).toBe(PaletteStyle.Content);
    expect(PaletteStyle.from("Rainbow")).toBe(PaletteStyle.Rainbow);
    expect(PaletteStyle.from("FruitSalad")).toBe(PaletteStyle.FruitSalad);
  });

  // it('from should throw an error when given an invalid name', () => {
  //    expect(() => PaletteStyle.from("NonExisting")).toThrowError();
  // });


  it('should allow PaletteStyle instance as input', () => {
    expect(PaletteStyle.from(PaletteStyle.Monochrome)).toBe(PaletteStyle.Monochrome);
    expect(PaletteStyle.from(PaletteStyle.Neutral)).toBe(PaletteStyle.Neutral);
    expect(PaletteStyle.from(PaletteStyle.TonalSpot)).toBe(PaletteStyle.TonalSpot);
    expect(PaletteStyle.from(PaletteStyle.Vibrant)).toBe(PaletteStyle.Vibrant);
    expect(PaletteStyle.from(PaletteStyle.Expressive)).toBe(PaletteStyle.Expressive);
    expect(PaletteStyle.from(PaletteStyle.Fidelity)).toBe(PaletteStyle.Fidelity);
    expect(PaletteStyle.from(PaletteStyle.Content)).toBe(PaletteStyle.Content);
    expect(PaletteStyle.from(PaletteStyle.Rainbow)).toBe(PaletteStyle.Rainbow);
    expect(PaletteStyle.from(PaletteStyle.FruitSalad)).toBe(PaletteStyle.FruitSalad);
  });

});
