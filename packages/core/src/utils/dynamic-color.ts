import {getContrastColor} from "./contrast.ts";
import {toHex} from "./conversion.ts";
import {DynamicColor, type DynamicScheme, MaterialDynamicColors} from "@material/material-color-utilities";

export function getMaterialDynamicColors(dynamicScheme: DynamicScheme) {
  const result: Record<string, number> = {};
  const dynamicKeys = Object.keys(MaterialDynamicColors);
  for (let i = 0, len = dynamicKeys.length; i < len; i++) {
    const key = dynamicKeys[i] as keyof typeof MaterialDynamicColors;
    const dynamicColor = MaterialDynamicColors[key];
    if (dynamicColor && dynamicColor instanceof DynamicColor) {
      result[key] = dynamicColor.getArgb(dynamicScheme)
    }
  }
  return result;
}

export function getContrastColorRole(role: string, dynamicScheme: DynamicScheme): string {
  const color = getColorDefinition(role);

  if (color.isBackground) {
    return getOnColorForBackground(role, dynamicScheme)
      ?? getContrastFallback(color, dynamicScheme);
  }

  if (isOnRole(role)) {
    return getBackgroundForOnRole(role, dynamicScheme)
      ?? getContrastFallback(color, dynamicScheme);
  }

  return getContrastFallback(color, dynamicScheme);
}

// Internal Helper Functions
function getColorDefinition(role: string): DynamicColor {
  const color = MaterialDynamicColors[role as keyof typeof MaterialDynamicColors];
  if (!color) {
    const validRoles = Object.keys(MaterialDynamicColors).join(', ');
    throw new Error(`Invalid color role: "${role}". Valid roles: ${validRoles}`);
  }
  return color as DynamicColor;
}

function getColorDefinitionSafe(role: string): DynamicColor | undefined {
  return MaterialDynamicColors[role as keyof typeof MaterialDynamicColors] as DynamicColor | undefined;
}

function getOnColorForBackground(backgroundRole: string, scheme: DynamicScheme): string | undefined {
  const onRole = `on${backgroundRole.charAt(0).toUpperCase()}${backgroundRole.slice(1)}`;
  const onColor = getColorDefinitionSafe(onRole);
  return onColor ? toHex(onColor.getArgb(scheme)) : undefined;
}

function getBackgroundForOnRole(onRole: string, scheme: DynamicScheme): string | undefined {
  const backgroundRole = getBackgroundRoleFromOnRole(onRole);
  const backgroundColor = getColorDefinitionSafe(backgroundRole);
  return backgroundColor ? toHex(backgroundColor.getArgb(scheme)) : undefined;
}

function getBackgroundRoleFromOnRole(onRole: string): string {
  const baseRole = onRole.slice(2);
  return baseRole.charAt(0).toLowerCase() + baseRole.slice(1);
}

function getContrastFallback(color: DynamicColor, scheme: DynamicScheme): string {
  return toHex(getContrastColor(color.getArgb(scheme)));
}

function isOnRole(role: string): boolean {
  return role.startsWith('on');
}
