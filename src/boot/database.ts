import { boot } from 'quasar/wrappers';
import DatabaseManager from 'src/services/db/DatabaseManager';

export default boot(async () => {
  try {
    const dbManager = DatabaseManager.getInstance();
    await dbManager.initDatabase(); // Initialize the database
    await dbManager.runMigrations(); // Apply migrations (if any)
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing the database:', error);
  }
});
