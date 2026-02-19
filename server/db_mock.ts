export let dbError: any = null;
export let db: any = {
    prepare: () => ({
        get: () => null,
        run: () => ({ lastInsertRowid: 1, changes: 1 }),
        all: () => []
    }),
    exec: () => { }
};

export async function initDb() {
    console.log("Mock database initialized");
}
