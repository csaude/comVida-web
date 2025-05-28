<template>
  <q-card flat bordered class="q-pa-none">

    <q-card-section class="q-pa-none">
      <q-banner dense inline-actions class="text-primary bg-grey-3  q-pa-none q-px-md q-py-xs">
        <span class="text-weight-medium">Cadastro de Utilizador</span>
        
    </q-banner>
    </q-card-section>

    <q-separator />

    <q-form class="q-gutter-md" @submit.prevent="submitForm">

      <q-card-section>

        <div class="row q-gutter-md q-mb-md">
          <q-input v-model="user.name" label="Nome" class="col" outlined dense />
          <q-input v-model="user.surname" label="Apelido" class="col" outlined dense />
        </div>

        <div class="row q-gutter-md q-mb-md">
          <q-input v-model="user.username" label="Username" class="col-5" outlined dense />
          <q-input v-model="user.password" type="password" label="Password" class="col-3" outlined dense />
          <q-input v-model="passwordConfirm" type="password" label="Confirme a Password" class="col" outlined dense />
        </div>

        <div class="row q-gutter-md">
          <q-select
            v-model="user.integratedSystem"
            :options="integratedSystems"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            label="Sistema Integrado"
            class="col-4"
            outlined
            dense
          />
          <q-input v-model="user.idOnIntegratedSystem" label="ID No Sistema Integrado" class="col-4" outlined dense />
        </div>

        <div class="q-mt-lg">
          <UserRolesTable
            v-model="user.roles"
            :programs="programs"
            :roles="roles"
          />
        </div>

      </q-card-section>

      <q-card-actions align="right" class="">
        <q-btn label="Cancelar" color="red" flat outlined @click="cancel"/>
        <q-btn label="Cadastrar" type="submit" color="primary" @click.prevent="submit"/>
      </q-card-actions>

    </q-form>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import UserRolesTable from './UserRolesTable.vue'


const emit = defineEmits(['submit-user', 'cancel'])

const user = ref({
  name: '',
  surname: '',
  username: '',
  password: '',
  integratedSystem: null,
  idOnIntegratedSystem: '',
  roles: [] // ← [{ programId, serviceId, role }]
})

const passwordConfirm = ref('')

const integratedSystems = [
  { id: 1, name: 'OpenMRS' },
  { id: 2, name: 'DHIS2' },
  { id: 3, name: 'iDART' }
]

const programs = [
  {
    id: 1,
    name: 'Programa de HIV',
    services: [
      { id: 101, name: 'Consulta Geral' },
      { id: 102, name: 'Enfermagem' }
    ]
  },
  {
    id: 2,
    name: 'Programa de TB',
    services: [
      { id: 201, name: 'Radiologia' },
      { id: 202, name: 'Tratamento' }
    ]
  }
]

const roles = [
  { label: 'Visualizador', value: 'viewer' },
  { label: 'Editor', value: 'editor' },
  { label: 'Gestor', value: 'admin' }
]

const submit = () => {
  emit('submit-user', { ...userForm.value })
}

const cancel = () => {
  emit('cancel')
}

const submitForm = () => {
  // Aqui você pode validar e submeter os dados do usuário
  console.log('Usuário a cadastrar:', user.value)
}
</script>
