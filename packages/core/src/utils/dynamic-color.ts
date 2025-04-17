import {contrastColor} from "./contrast.ts";
import {toHex} from "./conversion.ts";
import {DynamicColor, type DynamicScheme, MaterialDynamicColors} from "@material/material-color-utilities";
import camelcase from "camelcase";

export function contrastColorRole(role: string, scheme: DynamicScheme): string {
  const color = getColorDefinition(role);

  if (color.isBackground) {
    return getOnColorForBackground(role, scheme)
      ?? getContrastFallback(color, scheme);
  }

  if (isOnRole(role)) {
    return getBackgroundForOnRole(role, scheme)
      ?? getContrastFallback(color, scheme);
  }

  return getContrastFallback(color, scheme);
}

// Helper functions
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
  const onRole = `on${camelcase(backgroundRole, {pascalCase: true})}`;
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
  return toHex(contrastColor(color.getArgb(scheme)));
}

function isOnRole(role: string): boolean {
  return role.startsWith('on');
}
