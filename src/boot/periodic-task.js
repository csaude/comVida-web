import { startPeriodicTask } from 'src/services/background/PeriodicTaskManager';

export default async () => {
  // Start the periodic background task
  startPeriodicTask();
  console.log('Periodic task initialized.');
};
