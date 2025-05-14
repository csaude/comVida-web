<template>
  <div>
    <div class="q-pa-none q-gutter-sm q-mb-xl">
      <q-banner inline-actions class="bg-light-green-10 text-white">
        Configurar Unidade Sanitária
      </q-banner>
    </div>
    <div class="text-center q-my-lg">
      <q-avatar size="80px" font-size="52px" color="teal" text-color="white">
        <img src="../../../public/app-logo.png" alt="App Logo" />
      </q-avatar>
    </div>
    <div class="text-center q-my-lg">
      <label class="text-weight-medium text-light-green-10">
        Muzima
      </label>
    </div>
    <div class="q-pa-md">
      <q-input
        v-model="serverUrl"
        label="URL do Servidor"
        class="q-mb-md"
        outlined
        dense
      >
        <template v-slot:prepend>
          <q-icon name="link" />
        </template>
      </q-input>

      <q-input
        v-model="facilityName"
        label="Nome da Unidade Sanitária"
        class="q-mb-md"
        outlined
        dense
      >
        <template v-slot:prepend>
          <q-icon name="emergency" />
        </template>
      </q-input>

      <q-input
        outlined
        v-model="keyValue"
        :label="`Digite o valor para a chave: ${keyEntry}`"
        class="q-mb-md"
        dense
      >
        <template v-slot:prepend>
          <q-icon name="key" />
        </template>
      </q-input>

      <q-btn
        label="Gravar"
        color="green"
        class="full-width q-mb-md"
        @click="saveHealthFacility"
      />
      <q-btn
        label="CANCELAR"
        color="yellow-9"
        class="full-width"
        @click="$emit('cancel')"
      />
    </div>
    <div class="row q-mt-xl">
      <label class="col text-center">v{{ appVersion }}</label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { validKeyPairs } from 'src/data/keyPairs'; 
import { version } from '../../../package.json'
import { usePatientStore } from '../../stores/patient/patientStore';
import { Patient } from '../../entities/patient/Patient';

const { alertError, alertSuccess } = useSwal();


// Patient store
const patientStore = usePatientStore();
const patients = ref([]); // Local cache for patients
//const searchQuery = ref('');


// Reactive variables
const serverUrl = ref('');
const facilityName = ref('');
const keyValue = ref('');
const keyEntry = ref('');
const appVersion = version;

// Retrieve saved facilities from localStorage
const savedFacilities = ref([]);

// Load saved facilities from localStorage on mount
onMounted(async () => {
  const facilitiesFromStorage = localStorage.getItem('facilities');
  if (facilitiesFromStorage) {
    savedFacilities.value = JSON.parse(facilitiesFromStorage);
  }

  // Dynamically select a key entry for the user to validate
  if (validKeyPairs.length > 0) {
    const randomIndex = Math.floor(Math.random() * validKeyPairs.length); // Generate a random index
    keyEntry.value = validKeyPairs[randomIndex].entry; // Select a random key entry
  }

  // Create a new patient
  const newPatient = new Patient({
      name: 'John Silly',
      age: 32,
      gender: 'Male',
      encryptedData: 'Some encrypted data',
      identifiers: '123423456',
      tags: 'tag1,tag2',
      deletionStatus: 'ACTIVE',
      personId: 1,
      personUuid: 'uuid-1234324',
      birthdate: 631152000, // Example birthdate (UNIX timestamp)
      birthdateEstimated: 0,
      names: 'John Luis',
      attributes: 'attribute1',
      addresses: '123 Main St',
      voided: 0,
      personTags: 'tag1',
      uri: 'http://example.com',
      uuid: 'uuid-12334324',
    });

    console.log('newPatient===========>', newPatient);
    // Save the patient using the store
    await patientStore.savePatient(newPatient);
    console.log('New patient created and saved successfully.');

  // Fetch initial patient data
  try {
    await patientStore.search('John'); // Make sure this is marked as async
    patients.value = patientStore.patients;
    console.log('patients======================>', patients);

  } catch (error) {
    console.error('Error loading patients:', error);
    alertError('Erro ao carregar pacientes.');
  }
});


// Emit events for save and cancel
const emit = defineEmits(['save', 'cancel']);

// Save health facility function
const saveHealthFacility = () => {
  if (!serverUrl.value || !facilityName.value || !keyValue.value) {
    // Validate required fields
    alertError('Por favor, preencha todos os campos antes de continuar.');
    return;
  }

  // Validate the URL
  if (!isValidUrl(serverUrl.value)) {
    alertError('Por favor, insira uma URL válida.');
    return;
  }

  // Find the corresponding key pair
  const validKeyPair = validKeyPairs.find((pair) => pair.entry === keyEntry.value);

  // Validate the key value
  if (!validKeyPair || validKeyPair.value !== keyValue.value) {
    alertError('Valor da chave inválido. Por favor, tente novamente.');
    return;
  }

  // Check for duplication (by URL or name)
  const isDuplicate = savedFacilities.value.some(
    (facility) =>
      facility.url === serverUrl.value || facility.name === facilityName.value
  );

  if (isDuplicate) {
    alertError('Unidade Sanitária ou URL já existe. Evite duplicações.');
    return;
  }

  // Create facility object
  const facility = {
    url: serverUrl.value,
    name: facilityName.value,
    key: keyValue.value, // Include the key value in the facility object
  };

  // Add facility to savedFacilities
  savedFacilities.value.push(facility);

  // Save updated facilities to localStorage
  localStorage.setItem('facilities', JSON.stringify(savedFacilities.value));

  // Emit save event with the facility object
  emit('save', facility);

  // Show success message
  alertSuccess('Unidade Sanitária gravada com sucesso!');
};

const isValidUrl = (url) => {
  try {
    new URL(url); // If this succeeds, the URL is valid
    return true;
  } catch (error) {
    return false; // If it throws, the URL is invalid
  }
};

// Patient CRUD operations
// const searchPatients = async () => {
//   if (!searchQuery.value || searchQuery.value.length < 3) {
//     alertError('Por favor, insira pelo menos 3 caracteres para pesquisar.');
//     return;
//   }

//   try {
//     await patientStore.searchPatients(searchQuery.value);
//     patients.value = patientStore.patients;
//   } catch (error) {
//     console.error('Error searching patients:', error);
//     alertError('Erro ao pesquisar pacientes.');
//   }
// };

// const savePatient = async (patientData) => {
//   try {
//     await patientStore.savePatient(patientData);
//     alertSuccess('Paciente salvo com sucesso!');
//   } catch (error) {
//     console.error('Error saving patient:', error);
//     alertError('Erro ao salvar paciente.');
//   }
// };
</script>


<style scoped>
.add-health-facility {
  background-color: white;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.full-width {
  width: 100%;
}
</style>
