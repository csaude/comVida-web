<template>
    <div class="user-manager">
        <h1>User Manager</h1>
        <button @click="addUser">Add User</button>
        <ul>
            <li v-for="user in users" :key="user.id">
                {{ user.name }} - {{ user.email }}
                <button @click="removeUser(user.id)">Remove</button>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'UserManager',
    data() {
        return {
            users: [
                { id: 1, name: 'Alice', email: 'alice@example.com' },
                { id: 2, name: 'Bob', email: 'bob@example.com' }
            ]
        }
    },
    methods: {
        addUser() {
            const id = this.users.length + 1
            this.users.push({
                id,
                name: `User${id}`,
                email: `user${id}@example.com`
            })
        },
        removeUser(id) {
            this.users = this.users.filter(user => user.id !== id)
        }
    }
}
</script>

<style scoped>
.user-manager {
    max-width: 400px;
    margin: 2rem auto;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
}
button {
    margin-left: 1rem;
}
</style>