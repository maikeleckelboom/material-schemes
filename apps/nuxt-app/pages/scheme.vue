<script lang="ts" setup>
import { computed, shallowReactive } from "vue";
import {
  ContrastLevel,
  DynamicColorScheme,
  type DynamicColorSchemeOptions,
  PaletteStyle,
} from "@chromavert/material";

const options = shallowReactive<DynamicColorSchemeOptions>({
  sourceColor: "#54B6FF",
  style: PaletteStyle.Expressive,
  contrastLevel: ContrastLevel.Medium.value,
  isDark: false,
});

const dynamicScheme = computed(() => new DynamicColorScheme(options));

useHead({
  style: [
    {
      textContent: computed(() =>
        dynamicScheme.value.toCssVars({ selector: ":root" }),
      ),
    },
  ],
});
</script>

<template>
  <div class="grid grid-cols-[1fr_2fr] bg-(--background) text-(--foreground)">
    <div>
      <div>
        <label for="sourceColor">Source Color</label>
        <input
          id="sourceColor"
          v-model="options.sourceColor"
          type="color"
          class="border p-2 rounded-sm"
        />
      </div>
      <div>
        <select v-model="options.style" class="border p-2 rounded-sm">
          <option
            v-for="style in PaletteStyle.values"
            :key="style.name"
            :value="style"
          >
            {{ style.name }}
          </option>
        </select>
      </div>
      <div>
        <label for="isDark">Is Dark</label>
        <input
          id="isDark"
          v-model="options.isDark"
          type="checkbox"
          class="border p-2 rounded-sm"
        />
      </div>
      <div>
        <label for="contrastLevel">Contrast Level</label>
        <select v-model="options.contrastLevel" class="border p-2 rounded-sm">
          <option
            v-for="level in ContrastLevel.values"
            :key="level.name"
            :value="level.value"
          >
            {{ level.name }}
          </option>
        </select>
      </div>
    </div>
    <div class="grid grid-cols-2">
      <PrintJSON :data="dynamicScheme.toColorScheme()" />
    </div>
  </div>
</template>
