export class ContrastLevel {
  public readonly name: string;
  public readonly value: number;

  private constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  public static readonly Reduced = new ContrastLevel("Reduced", -1);
  public static readonly Default = new ContrastLevel("Default", 0);
  public static readonly Medium = new ContrastLevel("Medium", 0.5);
  public static readonly High = new ContrastLevel("High", 1.0);

  /** List of all defined contrast levels */
  public static readonly entries: readonly ContrastLevel[] = [
    ContrastLevel.Reduced,
    ContrastLevel.Default,
    ContrastLevel.Medium,
    ContrastLevel.High,
  ];

  /**
   * Determines and returns the appropriate contrast level for a given numeric value.
   *
   * @param value - The numeric value to evaluate for contrast.
   * @returns The corresponding ContrastLevel instance.
   */
  public static closest(value: number): ContrastLevel {
    if (value < 0) return ContrastLevel.Reduced;

    const levels = ContrastLevel.entries
      .filter((l) => l.value >= 0)
      .sort((a, b) => b.value - a.value);

    return levels.find((l) => value >= l.value) ?? ContrastLevel.Default;
  }
}
