export class Contrast {
  static readonly Reduced = new Contrast("Reduced", -1);
  static readonly Default = new Contrast("Default", 0.0);
  static readonly Medium = new Contrast("Medium", 0.25);
  static readonly High = new Contrast("High", 0.5);

  public readonly name: string;
  public readonly value: number;

  private constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  public static all(): Contrast[] {
    return Object.values(this).filter((v) => v instanceof Contrast);
  }

  public static closest(level: number): Contrast {
    if (level < 0) return this.Reduced;

    const levels = this.all()
      .filter((l) => l.value >= 0)
      .sort((a, b) => b.value - a.value);

    return levels.find((l) => level >= l.value) ?? this.Default;
  }
}
