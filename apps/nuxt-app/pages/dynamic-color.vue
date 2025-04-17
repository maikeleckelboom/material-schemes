<script lang="ts" setup>
import {DynamicColor, type DynamicScheme, Hct, MaterialDynamicColors} from '@material/material-color-utilities';
import {contrastColorRole, PaletteStyle, toHex} from "@chromavert/material";

const seedColor = Hct.fromInt(0xff6750a4)
const paletteStyle = PaletteStyle.fromName('FruitSalad');
const dynamicScheme = paletteStyle.dynamicScheme(seedColor);

function filterDynamicColors(dynamicScheme: DynamicScheme) {
  const result: Record<string, string> = {};
  const dynamicKeys = Object.keys(MaterialDynamicColors);
  for (let i = 0, len = dynamicKeys.length; i < len; i++) {
    const key = dynamicKeys[i] as keyof typeof MaterialDynamicColors;
    const token = MaterialDynamicColors[key];
    if (token && token instanceof DynamicColor) {
      result[key] = toHex(token.getArgb(dynamicScheme));
    }
  }
  return result;
}

</script>

<template>
  <div class="flex gap-0.5 flex-wrap">
    <div v-for="(dynamicColor, role) in filterDynamicColors(dynamicScheme)"
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
