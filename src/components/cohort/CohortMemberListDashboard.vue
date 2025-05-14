<template>
  <q-page class="home-page">

    <!-- Top Banner with User Info -->
    <div class="top-banner q-pa-sm">
      <q-item>
        <q-item-section avatar>
          <q-icon name="person" color="white" size="lg" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-bold text-white">Gildo Matos</q-item-label>
          <div class="row items-center q-ma-none">
            <q-btn dense flat :label="profile" color="white" no-caps class="q-pa-none" />
            <q-btn dense flat icon="arrow_drop_down" color="white" />
          </div>
        </q-item-section>
      </q-item>
    </div>

    <!-- Floating Search Input -->
    <div class="search-container">
      <q-input
        v-model="searchTerm"
        dense
        outlined
        color="amber-9"
        bg-color="white"
        placeholder="Pesquisar Nome / NID"
        class="custom-input"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- White Rounded Container for Content -->
    <div class="form-area column">
      <!-- Filters -->
        <!-- Filter Button -->
        <div class="row items-center q-my-sm">
            <q-btn
            dense
            flat
            icon="filter_alt"
            :label="filterButtonLabel"
            class="q-mr-xs"
            color="blue-6"
            no-caps
            @click="filterDialog = true"
            />

        <q-badge color="blue-6" rounded>{{ filteredMembers.length }}</q-badge>
        </div>

        <!-- Filter Dialog -->
        <q-dialog  v-model="filterDialog">
        <q-card style="min-width: 300px; max-width: 400px;">
            <q-card-section dense class="text-h6 bg-primary text-white">Selecionar Filtros</q-card-section>
            <q-separator />

            <q-card-section class="q-gutter-sm column">
            <!-- Toggle for Todos -->
            <q-toggle
                v-model="allPatients"
                label="Todos Utentes"
                color="primary"
                @update:model-value="onToggleAll"
            />

            <!-- Individual Filters -->
            <q-toggle
                v-for="opt in filterOptions"
                :key="opt.value"
                v-model="activeFilters[opt.value]"
                :label="opt.label"
                color="secondary"
                @update:model-value="() => onFilterChange(opt.value)"
            />
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
            <q-btn label="Cancelar" dense v-close-popup color="negative" />
            <q-btn label="Aplicar" dense color="primary" v-close-popup />
            </q-card-actions>
        </q-card>
        </q-dialog>




      <!-- Member List -->
      <CohortMemberList :members="filteredMembers" />

      <!-- Notification Bubble -->
      <div class="q-pa-sm fixed-bottom-right">
        <q-btn round color="red" icon="notifications">
          <q-badge color="white" text-color="red" floating transparent>3</q-badge>
        </q-btn>
      </div>
    </div>
    
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import CohortMemberList from 'src/components/cohort/CohortMemberList.vue';

const searchTerm = ref('');
const profile = ref('Ponto focal Adultos');

const filterDialog = ref(false);
const allPatients = ref(true);

const filterOptions = [
  { label: 'Faltoso', value: 'Faltoso' },
  { label: 'Abandono', value: 'Abandono' },
  { label: 'Elegível à carga viral', value: 'Elegivel a CV' },
  { label: 'Carga viral Alta', value: 'CV Alta' }
];

const activeFilters = ref({
  Faltoso: false,
  Abandono: false,
  'Elegivel a CV': false,
  'CV Alta': false
});

// Handle "Todos Utentes" toggle
function onToggleAll(val) {
  if (val) {
    Object.keys(activeFilters.value).forEach(k => (activeFilters.value[k] = false));
  }
}

// Handle specific filter toggle
function onFilterChange(changedKey) {
  if (activeFilters.value[changedKey]) {
    allPatients.value = false;
  }

  const anyActive = Object.values(activeFilters.value).some(v => v === true);
  if (!anyActive) {
    allPatients.value = true;
  }
}

const filterButtonLabel = computed(() => {
  if (allPatients.value) return 'Todos Utentes';

  const selected = Object.keys(activeFilters.value).filter(key => activeFilters.value[key]);
  return selected.length ? selected.join(', ') : 'Filtros';
});


const members = ref([
  {
    id: 1,
    name: 'Tom & Jerry',
    nid: '0269010079/3007/12337',
    address: 'Av. das Acacias nr 2023, Bairro 3',
    age: 26,
    gender: 'M',
    statuses: ['AL', 'SIM'],
    phoneNumber: '841234567'
  },
  {
    id: 2,
    name: 'Antonia Luis Matos',
    nid: '0269010079/3007/12338',
    address: 'Av. das Acacias nr 2023, Bairro 3',
    age: 26,
    gender: 'F',
    statuses: ['AA'],
    phoneNumber: '842222333'
  },
  {
    id: 3,
    name: 'Ashra Doce Lalitchandre',
    nid: '0269010079/3007/12355',
    address: 'Nicoadala, Polana chi min, pert...',
    age: 36,
    gender: 'F',
    statuses: ['AL', 'SIM'],
    phoneNumber: '847777888'
  },
  {
    id: 4,
    name: 'Ashra Doce Lalitchandre',
    nid: '0269010079/3007/12359',
    address: 'Nicoadala, Polana chi min, pert...',
    age: 23,
    gender: 'F',
    statuses: ['AL', 'SIM'],
    phoneNumber: '847777888'
  }
]);

const filteredMembers = computed(() => {
  const term = searchTerm.value.toLowerCase();

  return members.value
    .filter(
      m =>
        m.name.toLowerCase().includes(term) ||
        m.nid.toLowerCase().includes(term)
    )
    .sort((a, b) => a.name.localeCompare(b.name)); // 👈 alphabetic sort by name
});
</script>

<style scoped>
.home-page {
  height: 100%;
  width: 100%;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.top-banner {
  height: 125px;
  background-color: #009688;
  position: relative;
  z-index: 1;
}

.search-container {
  position: absolute;
  top: 75px;
  left: 0;
  width: 100%;
  padding: 0 16px;
  z-index: 2;
}

.form-area {
  background: #f5f5f5;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  padding: 24px 16px;
  margin-top: -38px;
  width: 100%;
  flex-grow: 1;
  position: relative;
  z-index: 1;
}

.custom-input .q-field__control {
  border: 1px solid #009688 !important;
  border-radius: 8px;
}
</style>
