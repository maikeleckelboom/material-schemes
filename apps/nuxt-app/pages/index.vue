<script lang="ts" setup>
import { DynamicColorScheme } from "@chromavert/material";
import PrintJSON from "~/components/PrintJSON.vue";

const scheme = computed(() => new DynamicColorScheme("#54B6FF"));

useHead({
  style: [
    {
      textContent: computed(() =>
        scheme.value.toCssText({
          selector: ":root",
          modifyColorScheme: (scheme) => ({
            ...scheme,
            fruitBanana: "#fff100",
          }),
        }),
      ),
    },
  ],
});
</script>

<template>
  <div class="grid grid-cols-2">
    <div class="size-24 m-4 bg-(--fruit-banana)"></div>
    <PrintJSON :data="scheme.toJSON()" />
    <PrintJSON :data="scheme.toCssVars()" />
  </div>
</template>
