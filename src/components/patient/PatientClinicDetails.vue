<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Header Box -->
    <q-card flat class="q-pa-sm row items-center">
      <q-avatar size="60px" color="pink-1" text-color="pink-10">
        <q-icon name="female" size="32px" />
      </q-avatar>
      <div class="q-ml-md">
        <div class="text-subtitle1 text-bold">Ashra Doce Lalitchandre</div>
        <div class="text-green-9 text-subtitle2">0269010079/3007/12355</div>
      </div>
    </q-card>

    <!-- Cohort Start Date and Statuses -->
    <div class="q-mt-md q-mb-md text-subtitle1 text-grey-8">
      Início coorte: <span class="text-black text-body2">28-02-2020</span>
    </div>
    <div class="row q-gutter-sm q-mb-md">
      <q-badge color="cyan-8" class=" text-body2" label="FALTOSO" />
      <q-badge color="amber" class=" text-body2" label="ELEGÍVEL A CARGA VIRAL" />
    </div>

    <!-- Clinical Cards -->
    <div class="column q-gutter-lg">

      <!-- Consulta -->
      <q-card class="bg-grey-3" flat>
        <q-card-section class="row items-center">
          <q-icon name="event_note" color="primary" size="md" class="q-mr-md" />
          <div>
            <div class="text-subtitle1 text-weight-medium">Consulta</div>
            <div class="text-caption text-grey-8">Última: 28-02-2020</div>
            <div class="text-caption text-grey-8">Próx.: 31-03-2020</div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ARV -->
      <q-card class="bg-grey-3" flat>
        <q-card-section class="row items-center">
          <q-icon name="medication" color="brown-5" size="md" class="q-mr-md" />
          <div>
            <div class="text-subtitle1 text-weight-medium">ARV</div>
            <div class="text-caption text-grey-8">Último: 28-02-2020</div>
            <div class="text-caption text-grey-8">Próx.: 31-03-2020</div>
            <div class="text-caption text-grey-8">Modo: Horario Normal de Exp.</div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TPT -->
      <q-card class="bg-grey-3" flat>
        <q-card-section class="row items-center">
          <img src="/public/lungs.png" alt="Pulmonology" style="width: 48px; height: 48px;" class="q-mr-sm items-left"/>
          <div>
            <div class="text-subtitle1 text-weight-medium">TPT</div>
            <div class="text-caption text-grey-8">Início: 28-02-2020</div>
            <div class="text-caption text-grey-8">Fim: 31-03-2020</div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Carga Viral -->
      <q-card class="bg-grey-3" flat>
        <q-card-section class="row items-center">
          <q-icon name="coronavirus" color="orange" size="md" class="q-mr-md" />
          <div>
            <div class="text-subtitle1 text-weight-medium">Carga Viral</div>
            <div class="text-caption text-grey-8">Result. <strong>&lt;20</strong></div>
            <div class="text-caption text-grey-8">17-01-2025</div>
          </div>
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script setup>
</script>

<style scoped>
.text-weight-medium {
  font-weight: 500;
}
</style>
