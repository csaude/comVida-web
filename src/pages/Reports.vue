<template>
    <div class="reports-page">
        <h1>Community Intervention Reports</h1>
        <ul>
            <li v-for="report in reports" :key="report.id">
                {{ report.title }} - {{ report.date }}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'Reports',
    data() {
        return {
            reports: [
                { id: 1, title: 'Food Distribution Event', date: '2024-06-01' },
                { id: 2, title: 'Health Awareness Workshop', date: '2024-06-05' },
                { id: 3, title: 'Youth Engagement Program', date: '2024-06-10' }
            ]
        }
    }
}
</script>

<style scoped>
.reports-page {
    padding: 20px;
}
</style>