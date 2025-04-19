<script lang="ts" setup>
import { contrastColor, MaterialTheme, toHex } from "@chromavert/material";
import PrintJSON from "~/components/PrintJSON.vue";

const theme = new MaterialTheme(0xa9a6266, [
  { name: "the sound of silence", value: 0x2b2d42 },
  { name: "a feeling of melancholy", value: 0x8d99ae },
  { name: "the taste of spicy mango", value: 0xd9b44a },
  { name: "the weight of unspoken words", value: 0x4e4c67 },
  { name: "an echo of forgotten", value: 0x6c63ff },
  { name: "the color of the wind", value: 0x00a896 },
  { name: "the sound of laughter", value: 0xfff3e0 },
  { name: "the smell of fresh rain", value: 0x2ec4b6 },
  { name: "the taste of sweet honey", value: 0xffbe0b },
  { name: "the warmth of a hug", value: 0xf9c74f },
]);
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <div class="grid grid-cols-6 gap-1">
      <div
        v-for="(val, key, i) in theme.toColorScheme({
          paletteTones: true,
          brightnessVariants: true,
          modifyColorScheme: (colorScheme) => {
            return colorScheme;
          },
        })"
        :key="i"
        :style="{ background: toHex(val), color: toHex(contrastColor(val)) }"
        class="p-3 h-24 rounded-sm flex flex-col"
      >
        <p class="truncate">{{ key }}</p>
      </div>
    </div>
    <div class="grid grid-cols-2">
      <PrintJSON :data="theme.toJSON()" />
      <PrintJSON :data="theme.toCssText()" />
    </div>
  </div>
</template>

<style scoped></style>
