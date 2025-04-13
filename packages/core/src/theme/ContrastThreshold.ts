export class ContrastThreshold {
  static readonly WCAG_AA_NORMAL_TEXT = new ContrastThreshold("WCAG_AA_NORMAL_TEXT", 4.5);
  static readonly WCAG_AA_LARGE_TEXT = new ContrastThreshold("WCAG_AA_LARGE_TEXT", 3);
  static readonly WCAG_AAA_NORMAL_TEXT = new ContrastThreshold("WCAG_AAA_NORMAL_TEXT", 7);
  static readonly WCAG_AAA_LARGE_TEXT = new ContrastThreshold("WCAG_AAA_LARGE_TEXT", 4.5);

  public readonly name: string;
  public readonly value: number;

  private constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  static all(): ContrastThreshold[] {
    return Object.values(this).filter((v) => v instanceof ContrastThreshold);
  }

  static fromName(name: string): ContrastThreshold {
    const found = this.all().find((v) => v.name === name);
    if (!found) throw new Error(`Invalid ContrastThreshold: ${name}`);
    return found;
  }

  static closest(targetValue: number): ContrastThreshold {
    const thresholds = this.all();
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
