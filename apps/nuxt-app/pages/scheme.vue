<script lang="ts" setup>
import { computed, shallowReactive } from "vue";
import {
  DynamicColorScheme,
  type DynamicColorSchemeOptions,
  PaletteStyle,
} from "@chromavert/material";

const options = shallowReactive<DynamicColorSchemeOptions>({
  sourceColor: "#54B6FF",
  style: PaletteStyle.Expressive,
});

const dynamicScheme = computed(() => new DynamicColorScheme(options));

useHead({
  style: [
    {
      textContent: computed(() =>
        dynamicScheme.value.toCssText({ selector: ":root" }),
      ),
    },
  ],
});
</script>

<template>
  <div class="grid grid-cols-[1fr_2fr]">
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
    <div class="grid grid-cols-2">
      <PrintJSON :data="dynamicScheme.toJSON()" />
      <PrintJSON :data="dynamicScheme.toCssVars()" />
    </div>
  </div>
</template>
