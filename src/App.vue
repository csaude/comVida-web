<template>
  <router-view />
</template>

<script setup lang="ts">
import '@fontsource/material-symbols-outlined';
import 'reflect-metadata'; // Required for TypeORM to work
defineOptions({
  name: 'App'
});
</script>
