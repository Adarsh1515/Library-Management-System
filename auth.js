import { lmsStorage } from './storage.js';

class Auth {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('lms_session') || 'null');
    }

    login(id, password, role) {
        const users = lmsStorage.get('USERS');
        const user = users.find(u => u.id === id && u.password === password && u.role === role);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('lms_session', JSON.stringify(user));
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('lms_session');
        window.location.reload();
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    getUser() {
        return this.currentUser;
    }
}

export const lmsAuth = new Auth();
