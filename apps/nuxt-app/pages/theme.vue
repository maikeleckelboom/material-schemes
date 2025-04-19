<script lang="ts" setup>
import { contrastColor, MaterialTheme, toHex } from "@chromavert/material";
import PrintJSON from "~/components/PrintJSON.vue";

const theme = new MaterialTheme(0xa9a6266, [
  { name: "he always says", value: 0xe5acc7 },
  { name: "misses the target", value: 0xab8c2d },
  { name: "she is stunning", value: 0xff5733 },
  { name: "my custom color", value: 0xa967a6 },
  { name: "and do the other thing", value: 0x8c7987 },
  { name: "who never does anything", value: 0x5938bb },
]);
</script>

<template>
  <div class="grid grid-cols-1 gap-4">
    <div>
      <div class="grid grid-cols-6 gap-1">
        <div
          v-for="(val, key, i) in theme.toColorScheme({
            paletteTones: true,
            brightnessVariants: true,
          })"
          :key="i"
          :style="{ background: toHex(val), color: toHex(contrastColor(val)) }"
          class="p-3 h-24 rounded-sm flex flex-col"
        >
          <p class="truncate">{{ key }}</p>
        </div>
      </div>
      <PrintJSON
        :data="
          theme.toColorScheme({
            paletteTones: [50, 60, 70, 80, 90],
          })
        "
      />

      <PrintJSON :data="theme.toCssText()" />
    </div>
  </div>
</template>

<style scoped></style>
