<script lang="ts" setup>
import {
  getContrastColorRole,
  getMaterialDynamicColors,
  PaletteStyle,
  toHex
} from '@chromavert/material';
import { Hct } from '@chromavert/material/material-color-utilities';

const sourceColor = Hct.fromInt(0xff6750a4);
const style = PaletteStyle.from('FruitSalad');
const dynamicScheme = style.dynamicScheme(sourceColor);
</script>

<template>
  <div class="flex gap-0.5 flex-wrap">
    <div
      v-for="(dynamicColor, role) in getMaterialDynamicColors(dynamicScheme)"
      :key="role"
      :style="{
        backgroundColor: toHex(dynamicColor),
        color: getContrastColorRole(role, dynamicScheme)
      }"
      class="p-2 rounded-sm"
    >
      <div>{{ role }}</div>
    </div>
  </div>
</template>
