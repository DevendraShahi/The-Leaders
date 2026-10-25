/** IndexedDB keeps full-resolution photos out of localStorage's small quota. */
let database: Promise<IDBDatabase> | undefined;
function open() {
    if (!database) database = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('the-leaders-web-studio', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('libraries');
        request.onsuccess = () => {
            request.result.onversionchange = () => { request.result.close(); database = undefined; };
            resolve(request.result);
        };
        request.onerror = () => reject(new Error('Browser draft storage is unavailable. Enable site storage and retry.'));
        request.onblocked = () => reject(new Error('Close other Studio tabs and retry.'));
    }).catch(error => { database = undefined; throw error; });
    return database;
}
const studioStorage = {
    async getItem(key: string): Promise<string | null> {
        const db = await open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('libraries', 'readonly');
            const request = tx.objectStore('libraries').get(key);
            tx.oncomplete = () => resolve(request.result ?? null);
            tx.onerror = () => reject(new Error('Drafts could not be read. Saved data has been preserved.'));
            tx.onabort = tx.onerror;
        });
    },
    async setItem(key: string, value: string): Promise<void> {
        const db = await open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('libraries', 'readwrite');
            tx.objectStore('libraries').put(value, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(new Error('Draft could not be saved. Browser storage may be full. Keep the editor open and retry.'));
            tx.onabort = tx.onerror;
        });
    },
};
export default studioStorage;
