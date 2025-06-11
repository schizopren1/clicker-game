const DB_NAME = 'ClickerGameDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameState';

let db;

export const openDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("[IDB] Помилка відкриття IndexedDB:", event.target.error);
      reject(`Помилка відкриття IndexedDB: ${event.target.error}`);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const tempDb = event.target.result;
      if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
        tempDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveGameState = async (gameStateToSave, key = 'mainGameState') => {
  try {
    const currentDb = await openDB();
    const transaction = currentDb.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put({ id: key, ...gameStateToSave });
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error("[IDB] Помилка збереження:", error);
  }
};

export const loadGameState = async (key = 'mainGameState') => {
  try {
    const currentDb = await openDB();
    if (!currentDb.objectStoreNames.contains(STORE_NAME)) {
        console.warn(`[IDB] Сховище ${STORE_NAME} не знайдено! Повертаю null.`);
        return null;
    }
    const transaction = currentDb.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result ? request.result : null);
      };
      request.onerror = (event) => {
        console.error("[IDB] Помилка завантаження:", event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error("[IDB] Критична помилка при завантаженні стану:", error);
    return null; // Повертаємо null, щоб гра могла продовжити роботу
  }
};