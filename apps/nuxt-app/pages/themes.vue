<script lang="ts" setup>
import {contrastColor, DynamicMaterialTheme, PaletteStyle, toHex} from "@chromavert/material";

const themeA = new DynamicMaterialTheme({primary: 0x54B6FF})

const themeB = new DynamicMaterialTheme({
  sourceColor: 0xa9a6266,
  style: PaletteStyle.Expressive,
  staticColors: [
    {name: 'he always says', value: 0xE5ACC7},
    {name: 'misses the target', value: 0xAB8C2D},
    {name: 'she is stunning', value: 0xFF5733},
    {name: 'my custom color', value: 0xa967a6},
    {name: 'and do the other thing', value: 0x8c7987},
    {name: 'who never does anything', value: 0x5938bb},
  ]
});
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <div class="grid grid-cols-6 gap-1">
        <div v-for="(val, key, i) in themeA.toColorScheme({paletteTones:[5,10,25,50,60,80,95] })"
             :key="i" :style="{ background: toHex(val), color: toHex(contrastColor(val)) }"
             class="p-3 rounded-sm flex flex-col">
          <p class="truncate">{{ key }}</p>
        </div>
      </div>
      <PrintJSON :data="themeA.toJSON()"/>
    </div>
    <div>
      <div class="grid grid-cols-6 gap-1">
        <div v-for="(val, key, i) in themeB.toColorScheme({brightnessVariants:true})"
             :key="i" :style="{ background: toHex(val), color: toHex(contrastColor(val)) }"
             class="p-3 rounded-sm flex flex-col">
          <p class="truncate">{{ key }}</p>
        </div>
      </div>
      <PrintJSON :data="themeB.toJSON()"/>
    </div>
  </div>
</template>

<style scoped>

</style>
