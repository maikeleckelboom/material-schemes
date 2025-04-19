<script lang="ts" setup>
import {
  contrastColorRole,
  getDynamicColors,
  Hct,
  PaletteStyle,
  toHex,
} from "@chromavert/material";

const sourceColor = Hct.fromInt(0xff6750a4);
const paletteStyle = PaletteStyle.fromName("FruitSalad");
const dynamicScheme = paletteStyle.dynamicScheme(sourceColor, false, 0.0);
</script>

<template>
  <div class="flex gap-0.5 flex-wrap">
    <div
      v-for="(dynamicColor, role) in getDynamicColors(dynamicScheme)"
      :key="role"
      :style="{
        backgroundColor: toHex(dynamicColor),
        color: contrastColorRole(role, dynamicScheme),
      }"
      class="p-2 rounded-sm"
    >
      <div>
        {{ role }}
      </div>
    </div>
  </div>
</template>
