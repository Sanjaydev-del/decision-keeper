import path from 'path';
import fs from 'fs';

export let dbError: any = null;
export let db: any = null;

async function initDb() {
  try {
    // Detect if running on Vercel
    const isVercel = process.env.VERCEL === '1';
    const dataDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'decision_keeper.db');

    // Dynamic import to prevent crash during module load
    const { default: Database } = await import('better-sqlite3');
    db = new Database(dbPath);

    // Initialize tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS decisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
    console.log("Database initialized successfully at", dbPath);
  } catch (error) {
    console.error("DATABASE INITIALIZATION ERROR:", error);
    dbError = error;
  }
}

// Initial attempt
initDb().catch(err => {
  console.error("CRITICAL DB INIT FAILURE:", err);
  dbError = err;
});
