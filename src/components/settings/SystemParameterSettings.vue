<template>
  <q-card flat bordered class="q-pa-none">
    <q-card-section class="bg-grey-3">
        <div class="row q-pa-none items-center">
            <div class="text-subtitle2 text-primary col items-center">Ative ou desative funcionalidades do sistema</div>
            <q-input
                outlined
                label="Pesquisar por Nome, descrição, Código"
                dense
                ref="recordCodeRef"
                class="col-4"
                style="width: 300px;"
                v-model="searchParams"
                @update:model-value="(value) => (filter = value)"
            >
                <template #action:append>
                    <q-icon
                        name="close"
                        @click="searchParams = ''"
                        class="cursor-pointer"
                    />
                </template>
            </q-input>
            <q-btn outline style="color: goldenrod;" dense icon="search" @click="searchUser" class="q-ml-sm">
                <q-tooltip class="bg-primary">Pesquisar</q-tooltip>
            </q-btn>
        </div>
      
      
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-list bordered separator>
        <q-item v-for="param in parameters" :key="param.key" class="q-px-md">
          <q-item-section>
            <q-item-label>{{ param.label }}</q-item-label>
            <q-item-label caption>{{ param.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="param.enabled"
              color="primary"
              @update:model-value="updateParameter(param)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'

const parameters = ref([
  {
    key: 'enable_notifications',
    label: 'Notificações automáticas',
    description: 'Ativa o envio automático de notificações por email ou sistema',
    enabled: true
  },
  {
    key: 'ai_session_summary',
    label: 'Resumo de Sessões com IA',
    description: 'Permite que o sistema gere automaticamente resumos com IA',
    enabled: false
  },
  {
    key: 'sync_on_start',
    label: 'Sincronização ao iniciar',
    description: 'Sincroniza dados automaticamente ao iniciar a aplicação',
    enabled: true
  }
])

const updateParameter = (param) => {
  console.log('Parâmetro atualizado:', param)
  // Aqui você pode emitir eventos ou fazer chamadas à API para salvar as configurações
}
</script>
