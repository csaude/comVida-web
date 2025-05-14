<template>
    <q-card
      flat
      class="q-mt-xl q-pa-sm bg-white"
      style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 999;"
    >
      <div class="row justify-around items-center">
        <q-btn
          flat
          round
          icon="home"
          size="lg"
          color="grey-7"
          @click="$emit('navigate', 'home')"
        />
  
        <q-btn
          flat
          round
          icon="fas fa-stethoscope"
          size="lg"
          color="primary"
          @click="$emit('navigate', 'clinic')"
        />
  
        <q-btn
          flat
          round
          icon="edit_document"
          size="lg"
          color="green-6"
          @click="$emit('navigate', 'demographics')"
        />
  
        <div style="position: relative;">
          <q-btn
            flat
            round
            icon="notifications"
            size="lg"
            color="amber-9"
            @click="$emit('navigate', 'notifications')"
          />
          <q-badge color="red" floating transparent>3</q-badge>
        </div>
      </div>
    </q-card>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  </style>