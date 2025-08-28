<template>
  <q-card-section class="q-pa-none">
         <q-banner dense inline-actions class="text-white bg-primary q-px-md full-width">
        Redefinir senha
        <template #action>
          <q-btn dense flat round color="white" icon="close" @click="$emit('cancel')"/>
        </template>
      </q-banner>
  </q-card-section>
    <q-card-section class="q-pa-none">
        <q-card flat class="q-pa-md q-mx-md q-mb-sm">
            <q-card-section>
                <div class="text-h6">
                    <q-avatar color="primary" text-color="white" icon="person" />
                    {{ user.username }}
                </div>
                <q-separator class="q-my-md" />
            </q-card-section>
            <q-card-section class="q-gutter-y-md">
                <q-input dense outlined v-model="newPassword" type="password" label="Nova senha" />
                <q-input dense outlined v-model="confirmPassword" type="password" label="Confirmar senha" />
            </q-card-section>

            <q-card-actions align="right">
                <q-btn dense color="red" label="Cancelar" @click="$emit('close')" />
                <q-btn dense color="primary" label="Salvar" @click="handlePasswordReset" />
            </q-card-actions>
        </q-card>
    </q-card-section>
  
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ user: Object })
const emit = defineEmits(['close'])
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useUserStore } from 'src/stores/user/userStore'

const newPassword = ref('')
const confirmPassword = ref('')
const { alertSucess, alertError, alertWarningAction } = useSwal();
const userStore = useUserStore()

const handlePasswordReset = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alertError("Senhas não coinscidem.")
    return
  }

   if (newPassword.value.length < 6) {
    alertError("A nova senha deve ter no mínimo 6 caracteres.")
    return
  }
  
    if (newPassword.value.length > 20) {
        alertError("A nova senha deve ter no máximo 20 caracteres.")
        return
    }

  const confirmed = await alertWarningAction(
    'Tem certeza que deseja alterar a senha?',
    'Esta acção não pode ser desfeita.'
  )

  if (!confirmed) return

  try {
    await userStore.updateUserPassword(props.user.uuid, newPassword.value)
    alertSucess('Senha atualizada com sucesso!')
    emit('close')
  } catch (e) {
    alertError('Erro ao atualizar senha.')
  }
}

</script>
