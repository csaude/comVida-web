<template>
    <div class="cohort-upload">
        <h2>Upload Cohort File</h2>
        <input type="file" @change="handleFileUpload" />
        <button :disabled="!selectedFile">Upload @click="submitFile"</button>
        <p v-if="uploadStatus">{{ uploadStatus }}</p>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedFile = ref(null)
const uploadStatus = ref('')

function handleFileUpload(event) {
    selectedFile.value = event.target.files[0]
}

async function submitFile() {
    if (!selectedFile.value) return
    uploadStatus.value = 'Uploading...'
    // Simulate upload
    setTimeout(() => {
        uploadStatus.value = 'Upload successful!'
    }, 1000)
}
</script>

<style scoped>
.cohort-upload {
    max-width: 400px;
    margin: 2rem auto;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
}
</style>