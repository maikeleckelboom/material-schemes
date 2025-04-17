<script lang="ts" setup>

</script>

<template>
  <div class=" bg-(--background) text-(--on-background)">
    <nav>
      <ul class="flex gap-4">
        <li>
          <NuxtLink to="/">Dynamic Scheme</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/dynamic-color">Dynamic Colors</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/themes">Material Themes</NuxtLink>
        </li>
      </ul>
    </nav>
    <NuxtPage/>
  </div>
</template>
