<script lang="ts" setup>
import {
  DynamicColorScheme,
  type DynamicColorSchemeOptions,
  PaletteStyle,
  toCssVariables,
  toHex,
} from "@chromavert/material";
import PrintJSON from "~/components/PrintJSON.vue";

const options = shallowReactive<DynamicColorSchemeOptions>({
  sourceColor: '#54B6FF',
  contrastLevel: 0.35,
  style: PaletteStyle.TonalSpot,
  isDark: false,
  primary: undefined,
  secondary: undefined,
  tertiary: undefined,
  neutral: undefined,
  neutralVariant: undefined,
});

const scheme = computed(() => new DynamicColorScheme(options));

const colorScheme = computed(() => scheme.value.toColorScheme({
  modifyColorScheme: (colorScheme) => ({
    ...colorScheme,
    accent: colorScheme.primary
  })
}))

useHead({
  style: [
    {
      textContent: computed(() => toCssVariables(colorScheme.value, ':root'))
    },
  ],
})
</script>

<template>
  <div class="grid grid-cols-2">
    <div>
      <div class="flex flex-col">
        <fieldset>
          <legend>Source Color</legend>
          <template v-if="options.sourceColor">
            <input v-model="options.sourceColor" type="color"/>
            <button @click="options.sourceColor = undefined">Disable</button>
          </template>
          <template v-else>
            <button @click="options.sourceColor = toHex(scheme.sourceColorArgb)">Enable</button>
          </template>
        </fieldset>

        <fieldset>
          <legend>Primary Color</legend>
          <template v-if="options.primary">
            <input v-model="options.primary" type="color"/>
            <button @click="options.primary = undefined">Disable</button>
          </template>
          <template v-else>
            <button @click="options.primary = toHex(scheme.primaryPaletteKeyColor)">Enable</button>
          </template>
        </fieldset>

        <fieldset>
          <legend>Secondary Color</legend>
          <template v-if="options.secondary">
            <input v-model="options.secondary" type="color"/>
            <button @click="options.secondary = undefined">Disable</button>
          </template>
          <template v-else>
            <button @click="options.secondary = toHex(scheme.secondaryPaletteKeyColor)">Enable</button>
          </template>
        </fieldset>

        <fieldset>
          <legend>Tertiary Color</legend>
          <template v-if="options.tertiary">
            <input v-model="options.tertiary" type="color"/>
            <button @click="options.tertiary = undefined">Disable</button>
          </template>
          <template v-else>
            <button @click="options.tertiary = toHex(scheme.tertiaryPaletteKeyColor)">Enable</button>
          </template>
        </fieldset>

        <fieldset>
          <legend>Neutral Color</legend>
          <template v-if="options.neutral">
            <input v-model="options.neutral" type="color"/>
            <button @click="options.neutral = undefined">Disable</button>
          </template>
          <template v-else>
            <button @click="options.neutral = toHex(scheme.neutralPaletteKeyColor)">Enable</button>
          </template>
        </fieldset>

        <fieldset>
          <legend>Neutral Variant Color</legend>
          <template v-if="options.neutralVariant">
            <input v-model="options.neutralVariant" type="color"/>
            <button @click="options.neutralVariant = undefined">Disable</button>
          </template>
          <template v-else>
            <button @click="options.neutralVariant = toHex(scheme.neutralVariantPaletteKeyColor)">Enable</button>
          </template>
        </fieldset>

        <fieldset>
          <legend>Contrast Level</legend>
          <input v-model.number="options.contrastLevel" max="1" min="-1" step="0.01" type="range"/>
        </fieldset>

        <fieldset>
          <legend>Palette Style</legend>
          <select v-model="options.style">
            <option v-for="style in PaletteStyle.entries" :key="style.name" :value="style">
              {{ style.name }}
            </option>
          </select>
        </fieldset>

        <fieldset>
          <legend>Is Dark Mode</legend>
          <input v-model="options.isDark" type="checkbox"/>
        </fieldset>
      </div>
    </div>
    <div>
      <PrintJSON :data="scheme.toJSON()"/>
    </div>
  </div>
</template>
