<template>
    <q-page class="bg-grey-2 column items-center justify-start">
      <div class="column items-center q-mt-xl">
        <q-avatar size="100px" class="q-mb-md">
          <img src="/muzima-logo.png" />
        </q-avatar>
  
        <div class="text-h4 text-teal text-weight-medium">mUzima</div>
        <div class="text-caption text-grey q-mt-md">v{{ appVersion }}</div>
      </div>
    </q-page>
  </template>
  
  <script setup>
  import { version } from '../../../package.json';
  
  const appVersion = version;
  </script>
  