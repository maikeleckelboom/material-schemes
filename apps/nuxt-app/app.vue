<script lang="ts" setup>
const routes = useRouter().options.routes;
</script>

<template>
  <div class="bg-(--background) text-(--on-background)">
    <nav>
      <ul class="flex gap-4">
        <li v-for="route in routes" :key="route.path">
          <NuxtLink :to="route.path" class="text-(--on-background)">
            {{ route.name }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
    <NuxtPage />
  </div>
</template>
