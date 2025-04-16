export class ContrastThreshold {
  public readonly name: string;
  public readonly value: number;

  private constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  public static readonly WCAG_AA_NORMAL_TEXT = new ContrastThreshold("WCAG_AA_NORMAL_TEXT", 4.5);
  public static readonly WCAG_AA_LARGE_TEXT = new ContrastThreshold("WCAG_AA_LARGE_TEXT", 3);
  public static readonly WCAG_AAA_NORMAL_TEXT = new ContrastThreshold("WCAG_AAA_NORMAL_TEXT", 7);
  public static readonly WCAG_AAA_LARGE_TEXT = new ContrastThreshold("WCAG_AAA_LARGE_TEXT", 4.5);

  /** List of all available contrast thresholds */
  public static readonly entries: readonly ContrastThreshold[] = [
    ContrastThreshold.WCAG_AA_NORMAL_TEXT,
    ContrastThreshold.WCAG_AA_LARGE_TEXT,
    ContrastThreshold.WCAG_AAA_NORMAL_TEXT,
    ContrastThreshold.WCAG_AAA_LARGE_TEXT,
  ];

  /**
   * Gets a contrast threshold by name.
   * @throws Error if no threshold with given name exists.
   */
  static valueOf(name: string): ContrastThreshold {
    const threshold = ContrastThreshold.entries.find(t => t.name === name);
    if (!threshold) {
      throw new Error(`Invalid ContrastThreshold: ${name}`);
    }
    return threshold;
  }

  /**
   * Gets the closest contrast threshold that does not exceed the target value.
   * If none is found, defaults to WCAG_AA_LARGE_TEXT.
   */
  static closest(targetValue: number): ContrastThreshold {
    const thresholds = this.entries;
    let currentMax = -Infinity;
    let currentCandidate: ContrastThreshold | null = null;

    for (const threshold of thresholds) {
      if (threshold.value <= targetValue) {
        if (threshold.value > currentMax) {
          currentMax = threshold.value;
          currentCandidate = threshold;
        } else if (threshold.value === currentMax) {
          currentCandidate = threshold;
        }
      }
    }

    return currentCandidate || this.WCAG_AA_LARGE_TEXT;
  }
}
