<script lang="ts" setup>
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import type { JSONDataType } from "vue-json-pretty/types/utils";

const {
  data,
  options = {
    virtual: false,
    deep: 2,
    showLength: true,
    collapsedOnClickBrackets: true,
  },
} = defineProps<{
  data?: JSONDataType;
  options?: ExtractPropTypes<typeof VueJsonPretty.props>;
}>();

const slots = defineSlots<{
  default: () => VNode;
}>();
</script>

<template>
  <VueJsonPretty :data="data" v-bind="options">
    <slot></slot>
  </VueJsonPretty>
</template>
