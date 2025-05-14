import BackgroundTaskService from './BackgroundTaskService';

export const startPeriodicTask = () => {

  const settings = JSON.parse(localStorage.getItem('settings')) || {};

  // Only run the periodic task if `autoSendUsage` is true
  if (!settings.autoSendUsage) {
    console.log('Periodic task will not run because autoSendUsage is disabled.');
    return;
  }

  // Initialize the periodic task
  setInterval(async () => {
    console.log('Periodic task started...');
    await BackgroundTaskService.startBackgroundTask();
  }, 2 * 60 * 1000); // 50 minutes
};
