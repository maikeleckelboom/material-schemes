export class Contrast {
  static readonly REDUCED = new Contrast("REDUCED", 3, -1, "Reduced");
  static readonly DEFAULT = new Contrast("DEFAULT", 0, 0, "Default");
  static readonly MEDIUM = new Contrast("MEDIUM", 1, 0.25, "Medium");
  static readonly HIGH = new Contrast("HIGH", 2, 0.5, "High");

  public readonly name: string;
  public readonly ordinal: number;
  public readonly value: number;
  public readonly label: string;

  private constructor(
    name: string,
    ordinal: number,
    value: number,
    label: string
  ) {
    this.name = name;
    this.ordinal = ordinal;
    this.value = value;
    this.label = label;
  }

  static values(): Contrast[] {
    return Object.values(this).filter(
      (v) => v instanceof Contrast
    );
  }

  static valueOf(name: string): Contrast {
    const found = this.values().find((v) => v.name === name);
    if (!found) throw new Error(`Invalid Contrast: ${name}`);
    return found;
  }

  static closestContrastLevel(targetLevel: number): Contrast {
    if (targetLevel < 0) return this.REDUCED;

    const levels = this.values()
      .filter((l) => l.value >= 0)
      .sort((a, b) => b.value - a.value);

    return levels.find((l) => targetLevel >= l.value) ?? this.DEFAULT;
  }
}
