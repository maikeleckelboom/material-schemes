export class ContrastLevel {
  /** Human-readable name for the contrast level (e.g., "High", "Default") */
  public readonly name: string;
  /**
   * Numeric representation of contrast level.
   * @note Values range from -1 (Reduced) to 1 (High), with 0 being default
   */
  public readonly value: number;

  /** @private Prevents arbitrary instance creation - use predefined static instances */
  private constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  /** For users with low vision who prefer less contrast */
  public static readonly Reduced = new ContrastLevel("Reduced", -1);
  /** Standard contrast level for typical viewing conditions */
  public static readonly Default = new ContrastLevel("Default", 0);
  /** Enhanced contrast for better readability in well-lit environments */
  public static readonly Medium = new ContrastLevel("Medium", 0.5);
  /** Maximum contrast for optimal readability in bright conditions */
  public static readonly High = new ContrastLevel("High", 1.0);

  /**
   * Complete list of available contrast levels in ascending order
   * @example Useful for generating UI controls to select contrast levels
   */
  public static readonly Values: readonly ContrastLevel[] = [
    ContrastLevel.Reduced,
    ContrastLevel.Default,
    ContrastLevel.Medium,
    ContrastLevel.High,
  ];

  /**
   * Finds the most appropriate contrast level for a given numeric value.
   * Handles both absolute Values and percentage-based inputs.
   *
   * @param value - Input value to match against known levels. Typically between -1 and 1,
   *                but can handle any number. Negative Values return Reduced immediately.
   * @returns The findClosest matching ContrastLevel instance
   *
   * @example
   * ContrastLevel.findClosest(0.3) // Returns ContrastLevel.Default
   * ContrastLevel.findClosest(0.7) // Returns ContrastLevel.Medium
   * ContrastLevel.findClosest(1.5) // Returns ContrastLevel.High
   */
  public static findClosest(value: number): ContrastLevel {
    if (value < 0) return ContrastLevel.Reduced;

    const levels = ContrastLevel.Values
      .filter((l) => l.value >= 0)
      .sort((a, b) => b.value - a.value);

    return levels.find((l) => value >= l.value) ?? ContrastLevel.Default;
  }
}
