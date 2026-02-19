import path from 'path';
import fs from 'fs';

// This is a simple JSON-based DB layer that mimics better-sqlite3's interface.
// It avoids native dependencies and works perfectly on Vercel's Serverless environment.

const isVercel = process.env.VERCEL === '1';
const dataDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'db.json');

interface LocalDb {
  users: any[];
  decisions: any[];
}

let data: LocalDb = { users: [], decisions: [] };

// Load initially if exists
if (fs.existsSync(dbPath)) {
  try {
    data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    console.error("Failed to load JSON DB", e);
  }
}

const saveData = () => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed to save JSON DB", e);
  }
};

export const db: any = {
  prepare: (query: string) => {
    // Simple mock of better-sqlite3 prepare/get/all/run
    const lowerQuery = query.toLowerCase();

    return {
      get: (...args: any[]) => {
        if (lowerQuery.includes('from users where email = ?')) {
          return data.users.find(u => u.email === args[0]) || null;
        }
        if (lowerQuery.includes('from decisions where id = ?')) {
          return data.decisions.find(d => d.id == args[0]) || null;
        }
        return null;
      },
      all: (...args: any[]) => {
        if (lowerQuery.includes('from decisions')) {
          if (lowerQuery.includes('where user_id = ?')) {
            return data.decisions
              .filter(d => d.user_id == args[0])
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          }
          return data.decisions;
        }
        return [];
      },
      run: (...args: any[]) => {
        if (lowerQuery.includes('insert into users')) {
          const newUser = {
            id: data.users.length + 1,
            email: args[0],
            password: args[1],
            created_at: new Date().toISOString()
          };
          data.users.push(newUser);
          saveData();
          return { lastInsertRowid: newUser.id, changes: 1 };
        }
        if (lowerQuery.includes('insert into decisions')) {
          const newDecision = {
            id: data.decisions.length + 1,
            user_id: args[0],
            title: args[1],
            description: args[2],
            category: args[3],
            created_at: new Date().toISOString()
          };
          data.decisions.push(newDecision);
          saveData();
          return { lastInsertRowid: newDecision.id, changes: 1 };
        }
        if (lowerQuery.includes('delete from decisions where id = ?')) {
          const id = args[0];
          const userId = args[1];
          const initialLength = data.decisions.length;
          data.decisions = data.decisions.filter(d => !(d.id == id && d.user_id == userId));
          saveData();
          return { changes: initialLength - data.decisions.length };
        }
        return { changes: 0 };
      }
    };
  },
  exec: () => { /* No-op for init tables */ },
  close: () => { saveData(); }
};

export const dbError = null;
export const initDb = async () => { console.log("JSON Storage initialized"); };

export default db;
