<template>
    <div class="settings-page">
        <el-tabs v-model="activeTab" tab-position="left">
            <el-tab-pane label="Profile" name="profile">
                <ProfileSettings />
            </el-tab-pane>
            <el-tab-pane label="Account" name="account">
                <AccountSettings />
            </el-tab-pane>
            <el-tab-pane label="Notifications" name="notifications">
                <NotificationSettings />
            </el-tab-pane>
            <el-tab-pane label="Privacy" name="privacy">
                <PrivacySettings />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import ProfileSettings from '@/components/settings/ProfileSettings.vue'
import AccountSettings from '@/components/settings/AccountSettings.vue'
import NotificationSettings from '@/components/settings/NotificationSettings.vue'
import PrivacySettings from '@/components/settings/PrivacySettings.vue'

const activeTab = ref('profile')
</script>

<style scoped>
.settings-page {
    padding: 24px;
    background: #fff;
    min-height: 100vh;
}
</style>