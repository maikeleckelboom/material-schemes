/**
 * Represents WCAG (Web Content Accessibility Guidelines) contrast ratio requirements.
 * These thresholds ensure the text remains readable for users with visual impairments.
 */
export class ContrastThreshold {
  /** Human-readable threshold name (e.g., "WCAG_AA_NORMAL_TEXT") */
  public readonly name: string;
  /** Minimum contrast ratio required by the standard */
  public readonly value: number;

  /** @private Prevents arbitrary instance creation - use predefined static instances */
  private constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  /** WCAG 2.0 Level AA - Normal text (4.5:1) */
  public static readonly WCAG_AA_NORMAL_TEXT = new ContrastThreshold("WCAG_AA_NORMAL_TEXT", 4.5);
  /** WCAG 2.0 Level AA - Large text (3:1) */
  public static readonly WCAG_AA_LARGE_TEXT = new ContrastThreshold("WCAG_AA_LARGE_TEXT", 3);
  /** WCAG 2.0 Level AAA - Normal text (7:1) */
  public static readonly WCAG_AAA_NORMAL_TEXT = new ContrastThreshold("WCAG_AAA_NORMAL_TEXT", 7);
  /** WCAG 2.0 Level AAA - Large text (4.5:1) */
  public static readonly WCAG_AAA_LARGE_TEXT = new ContrastThreshold("WCAG_AAA_LARGE_TEXT", 4.5);

  /** All available contrast thresholds in recommended evaluation order */
  public static readonly values: readonly ContrastThreshold[] = [
    ContrastThreshold.WCAG_AA_NORMAL_TEXT,
    ContrastThreshold.WCAG_AA_LARGE_TEXT,
    ContrastThreshold.WCAG_AAA_NORMAL_TEXT,
    ContrastThreshold.WCAG_AAA_LARGE_TEXT,
  ];

  /**
   * Retrieves a ContrastThreshold by its exact name
   *
   * @param name - Case-sensitive threshold name (e.g., "WCAG_AA_LARGE_TEXT")
   * @returns Matching ContrastThreshold instance
   * @throws {Error} For invalid/unrecognized threshold names
   */
  static fromName(name: string): ContrastThreshold {
    const threshold = ContrastThreshold.values.find(t => t.name === name);
    if (!threshold) {
      throw new Error(`Invalid ContrastThreshold: ${name}`);
    }
    return threshold;
  }

  /**
   * Finds the most rigorous contrast standard met by a given ratio.
   * Prioritizes higher standards first while ensuring minimum requirements are met.
   *
   * @param targetValue - Measured contrast ratio to evaluate
   * @returns Best achievable threshold that doesn't exceed the target,
   *          defaults to WCAG_AA_LARGE_TEXT if none found
   *
   * @example
   * ContrastThreshold.findClosest(4.2) // Returns WCAG_AA_LARGE_TEXT
   * ContrastThreshold.findClosest(4.6) // Returns WCAG_AAA_LARGE_TEXT
   */
  static findClosest(targetValue: number): ContrastThreshold {
    const thresholds = this.values;
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
