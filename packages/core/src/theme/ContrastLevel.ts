export class ContrastLevel {
  static readonly Reduced = new ContrastLevel("Reduced", -1);
  static readonly Default = new ContrastLevel("Default", 0);
  static readonly Medium = new ContrastLevel("Medium", 0.5);
  static readonly High = new ContrastLevel("High", 1.0);

  public readonly name: string;
  public readonly value: number;

  private constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  /**
   * Returns an array of values defined contrast levels.
   */
  public static values(): ContrastLevel[] {
    return Object.values(this).filter((v) => v instanceof ContrastLevel) as ContrastLevel[];
  }

  /**
   * Determines and returns the appropriate contrast level for a given numeric value.
   *
   * @param value - The numeric value to evaluate for contrast.
   * @returns The corresponding ContrastLevel instance.
   */
  public static closest(value: number): ContrastLevel {
    if (value < 0) return this.Reduced;

    const levels = this.values()
      .filter((l) => l.value >= 0)
      .sort((a, b) => b.value - a.value);

    return levels.find((l) => value >= l.value) ?? this.Default;
  }
}
