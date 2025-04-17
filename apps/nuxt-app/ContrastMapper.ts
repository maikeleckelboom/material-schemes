import {
  DynamicColor,
  DynamicScheme,
  MaterialDynamicColors,
  hexFromArgb,
} from '@material/material-color-utilities';

type DynamicColorRole = keyof typeof MaterialDynamicColors;

export class ContrastMapper {
  private contrastMap: Map<string, string>;

  constructor() {
    this.contrastMap = new Map();
  }

  addMapping(color: string, contrast: string): void {
    this.contrastMap.set(color, contrast);
  }

  getContrast(color: string): string | undefined {
    return this.contrastMap.get(color);
  }

  hasContrast(color: string): boolean {
    return this.contrastMap.has(color);
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function initializeContrastMapper(scheme: DynamicScheme): ContrastMapper {
  const contrastMapper = new ContrastMapper();

  const baseRoles: DynamicColorRole[] = Object.keys(
    MaterialDynamicColors
  ).filter((key) => MaterialDynamicColors[key as DynamicColorRole] instanceof DynamicColor) as DynamicColorRole[];

  for (const role of baseRoles) {
    const baseColorDynamic = MaterialDynamicColors[role] as DynamicColor;
    const onRoleKey = ('on' + capitalize(role)) as DynamicColorRole;

    if (MaterialDynamicColors[onRoleKey]) {
      const onColorDynamic = MaterialDynamicColors[onRoleKey] as DynamicColor;

      const baseArgb = baseColorDynamic.getArgb(scheme);
      const onArgb = onColorDynamic.getArgb(scheme);

      const baseHex = hexFromArgb(baseArgb);
      const onHex = hexFromArgb(onArgb);

      contrastMapper.addMapping(baseHex, onHex);
    }
  }

  return contrastMapper;
}
