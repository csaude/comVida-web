<template>
    <q-card flat bordered class="q-mb-md q-pa-md">
      <div class="col-12 text-center q-mb-md">
        <q-icon :name="genderIcon" :color="genderColor" size="lg" />
      </div>
      <div class="row items-center text-center">
        <div class="row">
          <!-- Patient Name -->
          <div class="col-12 text-weight-bold text-lg text-center">
            {{ patient?.display?.split(' - ')[1] || 'Sem Nome' }}
          </div>
          <!-- Patient Details -->
          <div class="col-12 text-caption text-center">
            <span>{{ patient?.identifiers?.[0]?.identifier || 'Sem NID' }}</span> |
            <span>{{ patient?.person?.age || 'Sem idade' }} anos</span> |
            <span>{{ patient?.identifiers?.[0]?.location?.name || 'Sem Localidade' }}</span>
          </div>
        </div>
      </div>
    </q-card>
  </template>
  <script setup>
  import { computed, inject } from 'vue';
  
  const patient = inject('selectedPatient');
  
  const genderIcon = computed(() => (patient?.value?.person?.gender === 'M' ? 'male' : 'female'));
  const genderColor = computed(() => (patient?.value?.person?.gender === 'M' ? 'blue' : 'pink'));
  </script>
  <style scoped>
  .q-card {
    border: 1px solid #e0e0e0;
  }
  .text-lg {
    font-size: 1.2em;
  }
  </style>
  