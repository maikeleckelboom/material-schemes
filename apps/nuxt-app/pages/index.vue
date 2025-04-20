<script lang="ts" setup>
import { MaterialDynamicScheme } from '@chromavert/material';

const sourceColor = ref<string>('#54B6FF');
const dynamicScheme = computed(() => new MaterialDynamicScheme(sourceColor.value));

useHead({
  style: [
    {
      textContent: computed(() => dynamicScheme.value.toCssVars({ selector: ':root' }))
    }
  ]
});
</script>

<template>
  <div class="grid grid-cols-[auto_1fr_1fr]">
    <div>
      <label for="sourceColor">Source Color</label>
      <input
        id="sourceColor"
        v-model="sourceColor"
        class="border p-2 rounded-sm"
        type="color"
      />
    </div>
    <PrintJSON :data="dynamicScheme.toColorScheme()" />
    <pre>{{
      dynamicScheme.toCssVars({
        selector: '.dark',
        minify: false
      })
    }}</pre>
  </div>
</template>
