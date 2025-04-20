<script lang="ts" setup>
import {
  type ExtendedColor,
  getContrastColor,
  MaterialTheme,
  toHex
} from '@chromavert/material';

const extendedColors = reactive<ExtendedColor[]>([
  { name: 'a feeling of melancholy', value: '#8d99ae' },
  { name: 'the taste of spicy mango', value: '#d9b44a' },
  { name: 'an echo of forgotten', value: '#6c63ff' },
  { name: 'the smell of fresh rain', value: '#2ec4b6' },
  { name: 'the taste of sweet honey', value: '#ffbe0b' },
  { name: 'a whisper of nostalgia', value: '#ff006e' },
  { name: 'the sound of laughter', value: '#8338ec' },
  { name: 'the touch of soft silk', value: '#ff677d' }
]);

const theme = computed<MaterialTheme>(() => new MaterialTheme(0xa9a6266, extendedColors));

const dark = ref<boolean>(false);

useHead({
  style: [
    {
      textContent: computed(() =>
        theme.value.toCssVars({
          selector: ':root',
          dark: dark.value
        })
      )
    }
  ]
});
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <fieldset>
        <label for="isDark">Dark</label>
        <input id="isDark" v-model="dark" class="border p-2 rounded-sm" type="checkbox" />
      </fieldset>
      <fieldset class="border p-2 rounded-sm">
        <legend>Custom Colors</legend>
        <div v-for="(color, index) in extendedColors" :key="index">
          <input
            v-model="color.name"
            class="border p-2 rounded-sm"
            placeholder="Name"
            type="text"
          />
          <input v-model="color.value" class="border p-2 rounded-sm" type="color" />
        </div>
      </fieldset>
      <div class="grid grid-cols-4 gap-1">
        <div
          v-for="(val, key, i) in theme.toColorScheme({
            paletteTones: true,
            brightnessVariants: true
          })"
          :key="i"
          :style="{
            background: toHex(val),
            color: toHex(getContrastColor(val))
          }"
          class="p-3 aspect-square rounded-sm flex flex-col"
        >
          <p class="truncate">{{ key }}</p>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2">
      <PrintJSON :data="theme as any" />
      <pre>{{
        theme.toCssVars({
          minify: false,
          selector: "[data-theme='midnight']"
        })
      }}</pre>
      <PrintJSON
        :data="
          theme.toColorScheme({
            brightnessVariants: true,
            paletteTones: true
          })
        "
        :options="{ deep: 2 }"
      />
    </div>
  </div>
</template>

<style scoped></style>
