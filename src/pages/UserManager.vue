<template>
  <div class="user-manager">
    <div v-if="currentView === 'list'" class="q-ma-md">
      <UserList
        :users="users"
        @remove-user="removeUser"
        @edit-user="editUser"
        @add-new-user="addNewUser"
        @import-users="openImport"
      />
    </div>

    <div v-if="currentView === 'form'" class="q-ma-md">
      <UserForm
        :user="userToEdit"
        @submit-user="handleUserFormSubmit"
        @cancel="closeForm"
      />
    </div>

    <div v-if="currentView === 'import'" class="q-ma-md">
      <UserImport @imported="handleUserImport" @cancel="closeForm" @close="closeForm" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UserForm from '../components/user/UserForm.vue'
import UserList from '../components/user/UserList.vue'
import UserImport from '../components/user/UserImport.vue'

const users = ref([
  { id: 1, name: 'Alice', surname: 'Silva', username: 'alice', status: 'Ativo' },
  { id: 2, name: 'Bob', surname: 'Souza', username: 'bob', status: 'Inativo' }
])

const currentView = ref('list')
const userToEdit = ref(null)

const addNewUser = () => {
  userToEdit.value = null
  currentView.value = 'form'
}

const editUser = (user) => {
  userToEdit.value = { ...user }
  currentView.value = 'form'
}

const openImport = () => {
  currentView.value = 'import'
}

const handleUserFormSubmit = (user) => {
  if (user.id) {
    // update existing user
    const idx = users.value.findIndex(u => u.id === user.id)
    if (idx >= 0) users.value[idx] = user
  } else {
    user.id = Date.now()
    user.status = 'Ativo'
    users.value.push(user)
  }
  currentView.value = 'list'
}

const handleUserImport = (importedUsers) => {
  users.value.push(...importedUsers)
  currentView.value = 'list'
}

const closeForm = () => {
  currentView.value = 'list'
}

const removeUser = (id) => {
  users.value = users.value.filter(user => user.id !== id)
}
</script>
