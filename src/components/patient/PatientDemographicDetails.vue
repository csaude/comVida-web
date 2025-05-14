<template>
    <q-page class="bg-grey-2 q-pa-md">
  
      <!-- Top Info -->
      <div class="column items-center q-mt-md q-mb-sm">
        <q-avatar size="100px" color="pink-2" text-color="pink-10">
          <q-icon name="female" size="48px" />
        </q-avatar>
        <div class="text-h6 text-bold q-mt-sm">Ashra Doce Lalitchandre</div>
        <div class="text-green text-h6 text-weight-regular">0269010079/3007/12355</div>
        <div class="q-mt-md row full-width items-center">
          <q-badge color="teal" class="q-mx-xs text-body2">AL</q-badge>
          <q-badge color="amber" class="q-mx-xs text-body2">Sim</q-badge>
          <q-badge color="purple" class="q-mx-xs text-body2">Pol</q-badge>
          <q-space />
          <div class="text-body2 text-grey-9">36 Anos</div>
        </div>
      </div>
  
      <!-- Contact Info -->
      <q-card flat bordered class="q-my-md q-pa-md">
        <q-card-section class="q-pa-sm row items-center">
          <q-icon name="call" color="orange" class="q-mr-sm" size="sm" />
          <div class="text-primary text-body1 ellipsis">842681818 / 875698547</div>
        </q-card-section>
  
        <q-separator />
  
        <q-card-section class="q-pa-sm row items-center">
          <q-icon name="place" color="green" class="q-mr-sm" size="sm" />
          <div class="text-body1">
            Nicoadala, Polana chi min, perto casa ximina
          </div>
        </q-card-section>
      </q-card>
  
      <!-- Confidente Info -->
      <q-card flat bordered class="q-my-md q-pa-md">
        <q-card-section class="q-pa-sm row items-start justify-between">
          <div>
            <div class="text-subtitle1 text-weight-medium">Confidente:</div>
            <div class="text-subtitle2">Nelia Baptista Eleuterio El.</div>
            <div class="row items-center q-mt-xs">
              <q-icon name="phone" size="16px" class="q-mr-xs" />
              <span class="text-subtitle2">842681818</span>
            </div>
          </div>
          <img src="/public/confidente.png" alt="Pulmonology" style="width: 68px; height: 68px;"/>
        </q-card-section>
      </q-card>
  
      <!-- Voluntário Info -->
      <q-card flat bordered class="q-my-md q-pa-md">
        <q-card-section class="q-pa-sm row items-center justify-between">
          <div>
            <div class="text-subtitle1 text-weight-medium">Último voluntário:</div>
            <div class="text-subtitle2">Vidhi Lalitchandre Ashra</div>
          </div>
          
          <img src="/public/voluntario.png" alt="Pulmonology" style="width: 68px; height: 68px;" />
        </q-card-section>
      </q-card>
  
    </q-page>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .text-weight-medium {
    font-weight: 500;
  }
  </style>
  