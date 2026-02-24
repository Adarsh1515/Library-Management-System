const STORAGE_KEYS = {
    BOOKS: 'lms_books',
    MEMBERS: 'lms_members',
    TRANSACTIONS: 'lms_transactions',
    USERS: 'lms_users'
};

const INITIAL_DATA = {
    BOOKS: [
        { id: 'B001', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', type: 'book', available: true },
        { id: 'M001', title: 'Inception', author: 'Christopher Nolan', type: 'movie', available: true }
    ],
    MEMBERS: [
        { id: 'M101', name: 'John Doe', type: '6 months', start: '2025-01-01', end: '2025-07-01', active: true }
    ],
    USERS: [
        { id: 'adm', password: 'adm', role: 'admin', name: 'System Admin' },
        { id: 'user', password: 'user', role: 'user', name: 'Regular User' }
    ]
};

class Storage {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
            localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_DATA.BOOKS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
            localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_DATA.MEMBERS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_DATA.USERS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
        }
    }

    get(key) {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS[key]) || '[]');
    }

    set(key, data) {
        localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
    }

    addItem(key, item) {
        const data = this.get(key);
        data.push(item);
        this.set(key, data);
    }

    updateItem(key, id, updatedFields) {
        const data = this.get(key);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updatedFields };
            this.set(key, data);
            return true;
        }
        return false;
    }
}

export const lmsStorage = new Storage();
