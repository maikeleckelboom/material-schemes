<script lang="ts" setup>
import {type DynamicScheme, Hct, MaterialDynamicColors} from '@material/material-color-utilities';
import {contrastColorRole, type DynamicColor, PaletteStyle, toHex} from "@chromavert/material";

const paletteStyle = PaletteStyle.valueOf('FruitSalad');
const dynamicScheme = paletteStyle.dynamicScheme(Hct.fromInt(0xff6750a4));

function generateDynamicColors(scheme: DynamicScheme) {
  const result: Record<string, string> = {}
  for (const [key, token] of Object.entries(
    MaterialDynamicColors
  ) as [string, DynamicColor][]) {
    if (token?.getArgb) {
      result[key] = toHex(token.getArgb(scheme))
    }
  }
  return result
}
</script>

<template>
  <div class="flex gap-0.5 flex-wrap">
    <div v-for="(dynamicColor, role) in generateDynamicColors(dynamicScheme)"
         :key="role"
         :style="{
           backgroundColor: toHex(dynamicColor),
           color: contrastColorRole(role, dynamicScheme)
         }"
         class="p-2 rounded-sm">
      <div>
        {{ role }}
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
