import { lmsAuth } from './auth.js';
import { lmsStorage } from './storage.js';

class App {
    constructor() {
        this.initEventListeners();
        this.checkAuth();
        this.handleRouting();
    }

    initEventListeners() {
        document.getElementById('login-form').addEventListener('submit', (e) => { e.preventDefault(); this.handleLogin(); });
        document.getElementById('logout-btn').addEventListener('click', () => { lmsAuth.logout(); });
        window.addEventListener('hashchange', () => { this.handleRouting(); });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    handleLogin() {
        const id = document.getElementById('login-id').value;
        const pass = document.getElementById('login-password').value;
        const role = document.getElementById('login-role').value;
        const errorEl = document.getElementById('login-error');
        if (lmsAuth.login(id, pass, role)) { errorEl.classList.add('hidden'); this.checkAuth(); }
        else { errorEl.classList.remove('hidden'); }
    }

    checkAuth() {
        const loginOverlay = document.getElementById('login-overlay');
        const appShell = document.getElementById('app-shell');
        const adminLinks = document.getElementById('admin-links');
        const userInfo = document.getElementById('user-info');

        if (lmsAuth.isAuthenticated()) {
            loginOverlay.classList.add('hidden'); appShell.classList.remove('hidden');
            const user = lmsAuth.getUser();
            userInfo.textContent = `${user.name} (${user.role.toUpperCase()})`;

            // Update Dashboard link text
            const homeText = lmsAuth.isAdmin() ? 'Home Admin' : 'Home User';
            const dashLink = document.querySelector('a[href="#dashboard"]');
            if (dashLink) dashLink.textContent = homeText;

            if (lmsAuth.isAdmin()) adminLinks.classList.remove('hidden');
            else adminLinks.classList.add('hidden');

            // Re-render view based on current hash
            this.handleRouting();
        } else { loginOverlay.classList.remove('hidden'); appShell.classList.add('hidden'); }
    }

    handleRouting() {
        const hash = window.location.hash || '#dashboard';
        const pageTitle = document.getElementById('page-title');
        const dashTitle = lmsAuth.isAuthenticated() ? (lmsAuth.isAdmin() ? 'Home Admin' : 'Home User') : 'Home';

        const routeNames = {
            '#dashboard': dashTitle,
            '#membership': 'Membership Management',
            '#books': 'Book/Movie Management',
            '#users': 'User Management',
            '#fine': 'Fine Payment',
            '#reports': 'Reports Menu',
            '#transactions': 'Transactions'
        };
        pageTitle.textContent = routeNames[hash] || 'Not Found';
        if (['#membership', '#books', '#users'].includes(hash) && !lmsAuth.isAdmin()) { window.location.hash = '#dashboard'; return; }
        this.renderView(hash);
    }

    renderView(hash) {
        const container = document.getElementById('view-container');
        switch (hash) {
            case '#dashboard':
                if (lmsAuth.isAdmin()) {
                    const categoryTable = `
                        <table style="width:100%; border-collapse: collapse;">
                            <thead>
                                <tr>
                                    <th style="border-right: 2px solid #000; border-bottom: 2px solid #000; padding: 8px; text-align: left;">Code No From</th>
                                    <th style="border-right: 2px solid #000; border-bottom: 2px solid #000; padding: 8px; text-align: left;">Code No To</th>
                                    <th style="border-right: 2px solid #000; border-bottom: 2px solid #000; padding: 8px; text-align: left;">Category</th>
                                    <th style="border-bottom: 2px solid #000; padding: 8px;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">SC(B/M)000001</td><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">SC(B/M)000004</td><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">Science</td><td style="border-bottom: 1px solid #000;"></td></tr>
                                <tr><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">EC(B/M)000001</td><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">EC(B/M)000004</td><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">Economics</td><td style="border-bottom: 1px solid #000;"></td></tr>
                                <tr><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">FC(B/M)000001</td><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">FC(B/M)000004</td><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">Fiction</td><td style="border-bottom: 1px solid #000;"></td></tr>
                                <tr><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">CH(B/M)000001</td><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">CH(B/M)000004</td><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">Children</td><td style="border-bottom: 1px solid #000;"></td></tr>
                                <tr><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">PD(B/M)000001</td><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">PD(B/M)000004</td><td style="border-right: 2px solid #000; border-bottom: 1px solid #000; padding: 5px;">Personal Development</td><td style="border-bottom: 1px solid #000;"></td></tr>
                                <tr><td style="border-right: 2px solid #000; border-bottom: 2px solid #000; padding: 15px;"></td><td style="border-right: 2px solid #000; border-bottom: 2px solid #000;"></td><td style="border-right: 2px solid #000; border-bottom: 2px solid #000;"></td><td style="border-bottom: 2px solid #000;"></td></tr>
                                <tr><td colspan="4" style="text-align: right; padding: 10px; font-weight: bold;"><a href="javascript:void(0)" id="grid-logout" style="color: black; text-decoration: none;">Log Out</a></td></tr>
                            </tbody>
                        </table>
                    `;
                    this.renderGridTemplate(container, 'Home Page', 'Product Details', categoryTable);
                    document.getElementById('grid-logout')?.addEventListener('click', () => lmsAuth.logout());
                } else {
                    this.renderGridTemplate(container, 'Home User', 'Welcome', `
                        <div style="padding: 20px; text-align: center;">
                            <h3>Welcome to the Library Management System</h3>
                            <p style="margin-top: 1rem; color: #64748b;">Use the navigation links above to search for books or view reports.</p>
                            <div style="text-align: right; padding: 10px; font-weight: bold; margin-top: 2rem; border-top: 2px solid #000;">
                                <a href="javascript:void(0)" id="grid-logout-user" style="color: black; text-decoration: none;">Log Out</a>
                            </div>
                        </div>
                    `);
                    document.getElementById('grid-logout-user')?.addEventListener('click', () => lmsAuth.logout());
                }
                break;
            case '#transactions':
                const isAdm = lmsAuth.isAdmin();
                const btnStyle = 'display: block; background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%); color: white; border: 1px solid #1e40af; padding: 15px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; text-decoration: none; text-align: center; cursor: pointer; box-shadow: 0 4px 0 #1e3a8a, 0 6px 12px rgba(0,0,0,0.15); transition: transform 0.1s;';
                const transContent = `
                    <div style="padding: 30px 60px; display: grid; gap: 1.5rem;">
                        <a href="#search" style="${btnStyle}">Check Book Availability</a>
                        ${isAdm ? `
                        <a href="#issue" style="${btnStyle}">Issue a Book</a>
                        <a href="#return" style="${btnStyle}">Return a Book</a>
                        <a href="#fine" style="${btnStyle}">Fine Payment</a>
                        ` : ''}
                    </div>
                    <div style="text-align: right; padding: 15px; font-weight: bold; border-top: 2px solid #000; background: #f8fafc;">
                        <a href="javascript:void(0)" id="grid-logout-trans" style="color: black; text-decoration: none; border-bottom: 1px solid transparent;" onmouseover="this.style.borderBottom='1px solid black'" onmouseout="this.style.borderBottom='1px solid transparent'">Log Out</a>
                    </div>
                `;
                this.renderGridTemplate(container, 'Transaction Page', 'Transaction Details', transContent);
                document.getElementById('grid-logout-trans')?.addEventListener('click', () => lmsAuth.logout());
                break;
            case '#membership': this.renderMembershipView(container); break;
            case '#books': this.renderBooksView(container); break;
            case '#users': this.renderUsersView(container); break;
            case '#search': this.renderSearchView(container); break;
            case '#issue': this.renderIssueView(container); break;
            case '#return': this.renderReturnView(container); break;
            case '#fine': this.renderFineView(container); break;
            case '#reports': this.renderReportsView(container); break;
            default: container.innerHTML = `<div class="card"><h3>Not Found</h3><p>The requested module does not exist.</p></div>`;
        }
    }

    renderMembershipView(container) {
        container.innerHTML = `
            <div class="card"><h3>Add Membership</h3>
                <form id="add-membership-form" style="margin-top:1.5rem;">
                    <div class="input-group"><label>Member Name *</label><input type="text" id="mem-name" required></div>
                    <div class="input-group"><label>Membership Duration *</label><select id="mem-duration"><option value="6 months" selected>6 Months</option><option value="1 year">1 Year</option><option value="2 years">2 Years</option></select></div>
                    <button type="submit" class="btn btn-primary">Create Membership</button><div id="add-mem-msg" style="margin-top:1rem;"></div>
                </form>
            </div>
            <div class="card" style="margin-top:2rem;"><h3>Update / Cancel Membership</h3>
                <form id="update-membership-form" style="margin-top:1.5rem;">
                    <div class="input-group"><label>Membership Number *</label><div style="display:flex; gap:0.5rem;"><input type="text" id="up-mem-id" required><button type="button" id="fetch-mem-btn" class="btn">Fetch</button></div></div>
                    <div id="update-fields" class="hidden">
                        <div class="input-group"><label>Current Status: <span id="cur-mem-status"></span></label></div>
                        <div class="input-group"><label>Action</label><select id="mem-action"><option value="extend">Extend Membership (6 months)</option><option value="cancel">Cancel Membership</option></select></div>
                        <button type="submit" class="btn btn-primary">Confirm Action</button>
                    </div>
                    <div id="up-mem-msg" style="margin-top:1rem;"></div>
                </form>
            </div>
        `;
        this.initMembershipListeners();
    }

    initMembershipListeners() {
        document.getElementById('add-membership-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = 'M' + Math.floor(Math.random() * 900 + 100);
            const duration = document.getElementById('mem-duration').value;
            const start = new Date(); const end = new Date();
            if (duration === '6 months') end.setMonth(start.getMonth() + 6); else if (duration === '1 year') end.setFullYear(start.getFullYear() + 1); else end.setFullYear(start.getFullYear() + 2);
            lmsStorage.addItem('MEMBERS', { id, name: document.getElementById('mem-name').value, duration, start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0], active: true });
            document.getElementById('add-mem-msg').innerHTML = `<p style="color:green;">ID: ${id}</p>`; e.target.reset();
        });
        document.getElementById('fetch-mem-btn').addEventListener('click', () => {
            const member = lmsStorage.get('MEMBERS').find(m => m.id === document.getElementById('up-mem-id').value);
            if (member) { document.getElementById('update-fields').classList.remove('hidden'); document.getElementById('cur-mem-status').textContent = member.active ? 'Active' : 'Cancelled'; }
            else { alert('Member not found.'); }
        });
        document.getElementById('update-membership-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('up-mem-id').value; const action = document.getElementById('mem-action').value;
            if (action === 'cancel') lmsStorage.updateItem('MEMBERS', id, { active: false });
            else { const m = lmsStorage.get('MEMBERS').find(i => i.id === id); const end = new Date(m.end); end.setMonth(end.getMonth() + 6); lmsStorage.updateItem('MEMBERS', id, { end: end.toISOString().split('T')[0], active: true }); }
            alert('Success!'); e.target.reset(); document.getElementById('update-fields').classList.add('hidden');
        });
    }

    renderBooksView(container) {
        container.innerHTML = `<div class="card"><h3>Add / Update Item</h3><form id="book-form" style="margin-top:1.5rem;"><div class="input-group"><label>Type</label><input type="radio" name="item-type" value="book" checked> Book <input type="radio" name="item-type" value="movie"> Movie</div><div class="input-group"><label>Title *</label><input type="text" id="book-title" required></div><div class="input-group"><label>Author *</label><input type="text" id="book-author" required></div><div class="input-group"><label>ID (Optional)</label><input type="text" id="book-id"></div><button type="submit" class="btn btn-primary">Save</button></form></div>`;
        document.getElementById('book-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const type = document.querySelector('input[name="item-type"]:checked').value;
            const title = document.getElementById('book-title').value; const author = document.getElementById('book-author').value; let id = document.getElementById('book-id').value;
            if (!id) { id = (type === 'book' ? 'B' : 'M') + Math.floor(Math.random() * 900 + 100); lmsStorage.addItem('BOOKS', { id, title, author, type, available: true }); }
            else { lmsStorage.updateItem('BOOKS', id, { title, author, type }); }
            alert('Saved!'); e.target.reset();
        });
    }

    renderUsersView(container) {
        container.innerHTML = `<div class="card"><h3>User Management</h3><form id="user-mgmt-form" style="margin-top:1.5rem;"><div class="input-group"><label>Type</label><input type="radio" name="user-type" value="new" checked> New <input type="radio" name="user-type" value="existing"> Existing</div><div class="input-group"><label>Name *</label><input type="text" id="user-name" required></div><div class="input-group"><label>ID *</label><input type="text" id="user-id" required></div><div class="input-group"><label>Pass *</label><input type="password" id="user-pass" required></div><button type="submit" class="btn btn-primary">Save User</button></form></div>`;
        document.getElementById('user-mgmt-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const type = document.querySelector('input[name="user-type"]:checked').value;
            const data = { id: document.getElementById('user-id').value, name: document.getElementById('user-name').value, password: document.getElementById('user-pass').value, role: 'user' };
            if (type === 'new') lmsStorage.addItem('USERS', data); else lmsStorage.updateItem('USERS', data.id, data);
            alert('User Saved!'); e.target.reset();
        });
    }

    renderSearchView(container) {
        const books = lmsStorage.get('BOOKS');
        const titles = [...new Set(books.map(b => b.title))];
        const authors = [...new Set(books.map(b => b.author))];

        const searchHtml = `
            <div style="padding: 20px; font-family: 'Arial', sans-serif;">
                <table style="width: 100%; border-collapse: collapse; border: 2px solid #000; background: white;">
                    <tr>
                        <td style="border: 1px solid #000; padding: 12px; width: 35%; font-weight: bold; background: #f8fafc;">Enter Book Name</td>
                        <td style="border: 1px solid #000; padding: 12px;">
                            <select id="search-title" style="width: 100%; border: 1px solid #cbd5e1; padding: 8px; font-size: 1rem; border-radius: 4px; background: #fff; cursor: pointer;">
                                <option value="">-- Select Book --</option>
                                ${titles.map(t => `<option value="${t}">${t}</option>`).join('')}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 12px; font-weight: bold; background: #f8fafc;">Enter Author</td>
                        <td style="border: 1px solid #000; padding: 12px;">
                            <select id="search-author" style="width: 100%; border: 1px solid #cbd5e1; padding: 8px; font-size: 1rem; border-radius: 4px; background: #fff; cursor: pointer;">
                                <option value="">-- Select Author --</option>
                                ${authors.map(a => `<option value="${a}">${a}</option>`).join('')}
                            </select>
                        </td>
                    </tr>
                </table>

                <div style="display: flex; gap: 4rem; justify-content: center; margin: 2rem 0;">
                    <button id="search-back-btn" 
                        style="background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%); color: white; border: 1px solid #1e40af; padding: 14px 45px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 0 #1e3a8a, 0 6px 12px rgba(0,0,0,0.15);">Back</button>
                    <button id="search-exec-btn" 
                        style="background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%); color: white; border: 1px solid #1e40af; padding: 14px 45px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 0 #1e3a8a, 0 6px 12px rgba(0,0,0,0.15);">Search</button>
                </div>

                <div id="search-results-grid"></div>

                <div style="text-align: right; margin-top: 2rem;">
                    <a href="javascript:void(0)" id="grid-logout-search" style="color: black; text-decoration: none; font-weight: bold;">Log Out</a>
                </div>
            </div>
        `;

        this.renderTransactionGridTemplate(container, 'Book Availability', searchHtml, '#search');

        document.getElementById('grid-logout-search')?.addEventListener('click', () => lmsAuth.logout());
        document.getElementById('search-back-btn').addEventListener('click', () => window.location.hash = '#dashboard');

        document.getElementById('search-exec-btn').addEventListener('click', () => {
            const title = document.getElementById('search-title').value.toLowerCase();
            const author = document.getElementById('search-author').value.toLowerCase();
            const resultsDiv = document.getElementById('search-results-grid');

            const filtered = books.filter(b => {
                const matchTitle = !title || b.title.toLowerCase() === title;
                const matchAuthor = !author || b.author.toLowerCase() === author;
                return matchTitle && matchAuthor;
            });

            if (filtered.length === 0) {
                resultsDiv.innerHTML = '<p style="padding: 10px; color: #ef4444;">No items found.</p>';
                return;
            }

            let html = '<table style="width:100%; border-collapse: collapse; border: 2px solid #000; margin-top: 1rem; background: white;"><thead><tr style="background:#f8fafc;"><th style="border:1px solid #000; padding:12px; text-align: left;">ID</th><th style="border:1px solid #000; padding:12px; text-align: left;">Title</th><th style="border:1px solid #000; padding:12px; text-align: left;">Status</th><th style="border:1px solid #000; padding:12px; text-align:center;">Select</th></tr></thead><tbody>';
            filtered.forEach(b => {
                html += `<tr><td style="border:1px solid #000; padding:10px;">${b.id}</td><td style="border:1px solid #000; padding:10px;">${b.title}</td><td style="border:1px solid #000; padding:10px;">${b.available ? '<span style="color:green;font-weight:bold;">Available</span>' : '<span style="color:red;font-weight:bold;">Issued</span>'}</td><td style="border:1px solid #000; padding:10px; text-align:center;"><input type="radio" name="sb" value="${b.id}" ${!b.available ? 'disabled' : ''}></td></tr>`;
            });
            html += '</tbody></table><div style="display:flex; justify-content:center; margin-top: 2rem;"><button id="pi" style="background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%); color: white; border: 1px solid #1e40af; padding: 14px 45px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 0 #1e3a8a, 0 6px 12px rgba(0,0,0,0.15);">Proceed to Issue</button></div>';
            resultsDiv.innerHTML = html;

            document.getElementById('pi')?.addEventListener('click', () => {
                const s = document.querySelector('input[name="sb"]:checked');
                if (s) {
                    sessionStorage.setItem('selected_book_id', s.value);
                    window.location.hash = '#issue';
                } else {
                    alert('Please select an available book.');
                }
            });
        });
    }

    renderIssueView(container) {
        const books = lmsStorage.get('BOOKS');
        const selectedId = sessionStorage.getItem('selected_book_id') || '';
        const selectedBook = books.find(i => i.id === selectedId);

        const issueFormHtml = `
            <div id="book-issue-container" style="padding: 20px; font-family: 'Arial', sans-serif;">
                <form id="book-issue-form">
                    <table style="width: 100%; border-collapse: collapse; border: 2px solid #000; background: white;">
                        <tr>
                            <td style="border: 1px solid #000; padding: 12px; width: 35%; font-weight: bold; background: #f8fafc;">Enter Book Name</td>
                            <td style="border: 1px solid #000; padding: 12px;">
                                <select id="issue-book-id" style="width: 100%; border: 1px solid #cbd5e1; padding: 8px; font-size: 1rem; border-radius: 4px; background: #fff; cursor: pointer;">
                                    <option value="">-- Select Book --</option>
                                    ${books.map(b => `<option value="${b.id}" ${b.id === selectedId ? 'selected' : ''}>${b.title}</option>`).join('')}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 12px; font-weight: bold; background: #f8fafc;">Enter Author</td>
                            <td style="border: 1px solid #000; padding: 12px; position: relative;">
                                <input type="text" id="issue-author" value="${selectedBook ? selectedBook.author : ''}" style="width: 100%; border: 1px solid #cbd5e1; padding: 8px; font-size: 1rem; border-radius: 4px; background: #f1f5f9;" readonly>
                                <div style="position: absolute; top: 0; right: 0; width: 0; height: 0; border-top: 10px solid red; border-left: 10px solid transparent;"></div>
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 12px; font-weight: bold; background: #f8fafc;">Issue Date</td>
                            <td style="border: 1px solid #000; padding: 12px;">
                                <input type="date" id="issue-date" value="${new Date().toISOString().split('T')[0]}" style="width: 100%; border: 1px solid #cbd5e1; padding: 8px; font-size: 1rem; border-radius: 4px; background: #fff;">
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 12px; font-weight: bold; background: #f8fafc;">Return Date</td>
                            <td style="border: 1px solid #000; padding: 12px; position: relative;">
                                <input type="date" id="issue-return-date" style="width: 100%; border: 1px solid #cbd5e1; padding: 8px; font-size: 1rem; border-radius: 4px; background: #f1f5f9;" readonly>
                                <div style="position: absolute; top: 0; right: 0; width: 0; height: 0; border-top: 10px solid red; border-left: 10px solid transparent;"></div>
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 12px; font-weight: bold; background: #f8fafc;">Remarks</td>
                            <td style="border: 1px solid #000; padding: 12px; display: flex; align-items: center; gap: 1rem;">
                                <textarea id="issue-remarks" style="flex: 1; border: 1px solid #cbd5e1; padding: 8px; font-size: 1rem; border-radius: 4px; height: 45px; resize: none;"></textarea>
                                <span style="font-size: 0.85rem; color: #64748b; font-weight: 500; font-style: italic;">Non Mandatory</span>
                            </td>
                        </tr>
                    </table>

                    <div style="display: flex; justify-content: center; gap: 4rem; margin-top: 2.5rem;">
                        <button type="button" id="cancel-issue-btn" 
                            style="background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%); color: white; border: 1px solid #1e40af; padding: 14px 45px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 0 #1e3a8a, 0 6px 12px rgba(0,0,0,0.15); transition: all 0.1s ease; outline: none;">Cancel</button>
                        <button type="submit" 
                            style="background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%); color: white; border: 1px solid #1e40af; padding: 14px 45px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 0 #1e3a8a, 0 6px 12px rgba(0,0,0,0.15); transition: all 0.1s ease; outline: none;">Confirm</button>
                    </div>
                </form>
                <div style="text-align: right; margin-top: 2rem; padding: 10px;">
                    <a href="javascript:void(0)" id="grid-logout-issue" style="color: black; text-decoration: none; font-weight: bold; border-bottom: 1px solid transparent;" onmouseover="this.style.borderBottom='1px solid black'" onmouseout="this.style.borderBottom='1px solid transparent'">Log Out</a>
                </div>
            </div>
        `;

        this.renderTransactionGridTemplate(container, 'Book Issue', issueFormHtml, '#issue');

        // Re-align Log Out to be truly bottom right of the main content area
        const issueForm = document.getElementById('book-issue-form');
        const cancelButton = document.getElementById('cancel-issue-btn');
        const issueDateInput = document.getElementById('issue-date');
        const returnDateInput = document.getElementById('issue-return-date');

        cancelButton.addEventListener('click', () => window.location.hash = '#transactions');

        const updateReturnDate = () => {
            if (issueDateInput.value) {
                const d = new Date(issueDateInput.value);
                d.setDate(d.getDate() + 15);
                returnDateInput.value = d.toISOString().split('T')[0];
            }
        };
        updateReturnDate();
        issueDateInput.addEventListener('change', updateReturnDate);

        document.getElementById('issue-book-id').addEventListener('change', (e) => {
            const b = books.find(i => i.id === e.target.value);
            document.getElementById('issue-author').value = b ? b.author : '';
        });

        document.getElementById('grid-logout-issue')?.addEventListener('click', () => lmsAuth.logout());

        issueForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const bid = document.getElementById('issue-book-id').value;
            const book = books.find(i => i.id === bid);
            if (!book) return alert('Please select a book.');
            if (!book.available) return alert('This book is already issued.');

            lmsStorage.addItem('TRANSACTIONS', {
                id: 'T' + Date.now(),
                bookId: bid,
                bookName: book.title,
                issueDate: issueDateInput.value,
                returnDate: returnDateInput.value,
                remarks: document.getElementById('issue-remarks').value,
                status: 'issued'
            });
            lmsStorage.updateItem('BOOKS', bid, { available: false });
            sessionStorage.removeItem('selected_book_id');
            alert('Book Issued Successfully!');
            window.location.hash = '#dashboard';
        });
    }

    renderReturnView(container) {
        const returnFormHtml = `
            <div style="padding: 20px; font-family: 'Arial', sans-serif;">
                <form id="rf">
                    <table style="width: 100%; border-collapse: collapse; border: 2px solid #000; background: white;">
                        <tr>
                            <td style="border: 1px solid #000; padding: 12px; width: 35%; font-weight: bold; background: #f8fafc;">Enter Book ID</td>
                            <td style="border: 1px solid #000; padding: 12px; position: relative;">
                                <input type="text" id="rid" placeholder="e.g. B001" style="width: 100%; border: 1px solid #cbd5e1; padding: 8px; font-size: 1rem; border-radius: 4px; background: #fff;">
                                <div style="position: absolute; top: 0; right: 0; width: 0; height: 0; border-top: 10px solid red; border-left: 10px solid transparent;"></div>
                            </td>
                        </tr>
                    </table>
                    <div style="display: flex; justify-content: center; gap: 4rem; margin-top: 2.5rem;">
                         <button type="button" onclick="window.location.hash='#transactions'" 
                            style="background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%); color: white; border: 1px solid #1e40af; padding: 14px 45px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 0 #1e3a8a, 0 6px 12px rgba(0,0,0,0.15);">Cancel</button>
                        <button type="submit" 
                            style="background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%); color: white; border: 1px solid #1e40af; padding: 14px 45px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 0 #1e3a8a, 0 6px 12px rgba(0,0,0,0.15);">Proceed</button>
                    </div>
                </form>
                <div style="text-align: right; margin-top: 2rem;">
                    <a href="javascript:void(0)" id="grid-logout-return" style="color: black; text-decoration: none; font-weight: bold;">Log Out</a>
                </div>
            </div>
        `;
        this.renderTransactionGridTemplate(container, 'Return Book', returnFormHtml, '#return');
        document.getElementById('grid-logout-return')?.addEventListener('click', () => lmsAuth.logout());
        document.getElementById('rf')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('rid').value;
            const tx = lmsStorage.get('TRANSACTIONS').find(t => t.bookId === id && t.status === 'issued');
            if (tx) {
                const fine = Math.max(0, Math.ceil((new Date() - new Date(tx.returnDate)) / (1000 * 60 * 60 * 24)) * 10);
                sessionStorage.setItem('pq', JSON.stringify({ ...tx, fine }));
                window.location.hash = '#fine';
            } else alert('No active issue found for this Book ID.');
        });
    }

    renderFineView(container) {
        const q = JSON.parse(sessionStorage.getItem('pq') || '{}');
        if (!q.id) {
            container.innerHTML = '<p style="padding:20px;">No pending return processing found.</p>';
            return;
        }
        const fineHtml = `
            <div style="padding: 20px; font-family: 'Arial', sans-serif;">
                <div style="border: 2px solid #000; background: white;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="border: 1px solid #000; padding: 12px; width: 35%; font-weight: bold; background: #f8fafc;">Book Name</td>
                            <td style="border: 1px solid #000; padding: 12px;">${q.bookName}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 12px; font-weight: bold; background: #f8fafc;">Fine Calculated</td>
                            <td style="border: 1px solid #000; padding: 12px; color: #ef4444; font-weight: bold;">$${q.fine}</td>
                        </tr>
                    </table>
                </div>
                <div style="display: flex; justify-content: center; gap: 4rem; margin-top: 2.5rem;">
                     <button type="button" onclick="window.location.hash='#return'" 
                        style="background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%); color: white; border: 1px solid #1e40af; padding: 14px 45px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 0 #1e3a8a, 0 6px 12px rgba(0,0,0,0.15);">Back</button>
                    <button id="cf" 
                        style="background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%); color: white; border: 1px solid #1e40af; padding: 14px 45px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 0 #1e3a8a, 0 6px 12px rgba(0,0,0,0.15);">Confirm & Pay</button>
                </div>
                <div style="text-align: right; margin-top: 2rem;">
                    <a href="javascript:void(0)" id="grid-logout-fine" style="color: black; text-decoration: none; font-weight: bold;">Log Out</a>
                </div>
            </div>
        `;
        this.renderTransactionGridTemplate(container, 'Pay Fine', fineHtml, '#fine');
        document.getElementById('grid-logout-fine')?.addEventListener('click', () => lmsAuth.logout());
        document.getElementById('cf')?.addEventListener('click', () => {
            lmsStorage.updateItem('TRANSACTIONS', q.id, { status: 'returned', fine: q.fine });
            lmsStorage.updateItem('BOOKS', q.bookId, { available: true });
            alert('Book Returned and Fine Paid!');
            window.location.hash = '#dashboard';
        });
    }

    renderReportsView(container) {
        const reportsContent = `
                <div style="padding: 20px;">
                    <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1.5rem; justify-content: center;">
                        <button class="btn rep-btn" data-type="tx">Active Issues</button>
                        <button class="btn rep-btn" data-type="members">Master Membership</button>
                        <button class="btn rep-btn" data-type="movies">Master Movies</button>
                        <button class="btn rep-btn" data-type="books">Master Books</button>
                        <button class="btn rep-btn" data-type="overdue">Overdue</button>
                        <button class="btn rep-btn" data-type="pending">Pending Request</button>
                    </div>
                    <div id="report-output" style="min-height: 200px; border: 1px solid #ddd; padding: 10px; background: #f9fafb;"></div>
                    <div style="text-align: right; padding: 10px; font-weight: bold; margin-top: 1rem; border-top: 2px solid #000;">
                        <a href="javascript:void(0)" id="grid-logout-rep" style="color: black; text-decoration: none;">Log Out</a>
                    </div>
                </div>
            `;
        this.renderGridTemplate(container, 'Reports Menu', 'System Reports', reportsContent);
        document.getElementById('grid-logout-rep')?.addEventListener('click', () => lmsAuth.logout());
        document.querySelectorAll('.rep-btn').forEach(b => b.addEventListener('click', (e) => this.showReport(e.target.dataset.type)));
    }

    showReport(type) {
        const out = document.getElementById('report-output');
        let data = [];
        let html = '<table style="width:100%; border-collapse:collapse;"><thead><tr style="border-bottom:2px solid #ddd;">';

        switch (type) {
            case 'books':
                data = lmsStorage.get('BOOKS').filter(b => b.type === 'book');
                html += '<th>ID</th><th>Title</th><th>Author</th><th>Status</th></tr></thead><tbody>';
                data.forEach(x => html += `<tr><td>${x.id}</td><td>${x.title}</td><td>${x.author}</td><td>${x.available ? 'Available' : 'Issued'}</td></tr>`);
                break;
            case 'movies':
                data = lmsStorage.get('BOOKS').filter(b => b.type === 'movie');
                html += '<th>ID</th><th>Title</th><th>Director</th><th>Status</th></tr></thead><tbody>';
                data.forEach(x => html += `<tr><td>${x.id}</td><td>${x.title}</td><td>${x.author}</td><td>${x.available ? 'Available' : 'Issued'}</td></tr>`);
                break;
            case 'members':
                data = lmsStorage.get('MEMBERS');
                html += '<th>ID</th><th>Name</th><th>End Date</th><th>Status</th></tr></thead><tbody>';
                data.forEach(x => html += `<tr><td>${x.id}</td><td>${x.name}</td><td>${x.end}</td><td>${x.active ? 'Active' : 'Cancelled'}</td></tr>`);
                break;
            case 'tx':
                data = lmsStorage.get('TRANSACTIONS').filter(t => t.status === 'issued');
                html += '<th>TX ID</th><th>Book</th><th>Due Date</th></tr></thead><tbody>';
                data.forEach(x => html += `<tr><td>${x.id}</td><td>${x.bookName}</td><td>${x.returnDate}</td></tr>`);
                break;
            case 'overdue':
                const today = new Date();
                data = lmsStorage.get('TRANSACTIONS').filter(t => t.status === 'issued' && new Date(t.returnDate) < today);
                html += '<th>Book</th><th>Due Date</th><th>Fine Est.</th></tr></thead><tbody>';
                data.forEach(x => { const fine = Math.ceil((today - new Date(x.returnDate)) / (1000 * 60 * 60 * 24)) * 10; html += `<tr><td>${x.bookName}</td><td>${x.returnDate}</td><td>$${fine}</td></tr>`; });
                break;
            case 'pending':
                html += '<th>Request ID</th><th>Member ID</th><th>Requested Item</th><th>Date</th></tr></thead><tbody>';
                html += '<tr><td>REQ001</td><td>M101</td><td>The Hobbit</td><td>2026-02-23</td></tr>';
                break;
        }
        html += '</tbody></table>';
        out.innerHTML = html || '<p>No data available.</p>';
    }

    renderGridTemplate(container, pageTitle, contentTitle, contentHtml) {
        const isAdmin = lmsAuth.isAdmin();
        container.innerHTML = `
            <div style="background: white; border: 2px solid #000; font-family: 'Arial', sans-serif; max-width: 1000px; margin: 0 auto; color: black; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <!-- Header Grid: Row 1 -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; border-bottom: 2px solid #000;">
                    <div style="border-right: 2px solid #000; padding: 10px; font-weight: bold; text-align: left;">Chart</div>
                    <div style="border-right: 2px solid #000; padding: 10px; font-weight: bold; text-align: center; text-transform: uppercase;">${pageTitle}</div>
                    <div style="border-right: 2px solid #000; padding: 10px;"></div>
                    <div style="padding: 10px; font-weight: bold; text-align: left;"><a href="#dashboard" style="color: black; text-decoration: none;">Back</a></div>
                </div>
                
                <!-- Header Grid: Row 2 -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; border-bottom: 2px solid #000;">
                    <div style="border-right: 2px solid #000; padding: 10px; font-weight: bold; text-align: left;">
                        <a href="#reports" style="color: black; text-decoration: none;">Reports</a>
                    </div>
                    <div style="border-right: 2px solid #000; padding: 10px;"></div>
                    <div style="border-right: 2px solid #000; padding: 10px; font-weight: bold; text-align: left;">
                        <a href="#transactions" style="color: black; text-decoration: none;">Transactions</a>
                    </div>
                    <div style="padding: 10px;"></div>
                </div>

                <!-- Title Bar -->
                <div style="text-align: center; font-weight: bold; border-bottom: 2px solid #000; padding: 5px; background: #f8fafc;">${contentTitle}</div>

                <!-- Content Area -->
                <div style="padding: 0;">
                    ${contentHtml}
                </div>
            </div>
        `;
    }

    renderTransactionGridTemplate(container, contentTitle, contentHtml, activeHash) {
        container.innerHTML = `
            <div style="background: white; border: 2px solid #000; font-family: 'Arial', sans-serif; max-width: 1000px; margin: 0 auto; color: black; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <!-- Top Header -->
                <div style="display: grid; grid-template-columns: 200px 1fr 200px; border-bottom: 2px solid #000; background: #f8fafc;">
                    <div style="border-right: 2px solid #000; padding: 12px; font-weight: bold; text-align: left;">Chart</div>
                    <div style="border-right: 2px solid #000; padding: 12px; font-weight: bold; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Transactions</div>
                    <div style="padding: 12px; font-weight: bold; text-align: right;"><a href="#dashboard" style="color: black; text-decoration: none; border-bottom: 1px solid black;">Home</a></div>
                </div>

                <!-- Main Content Row -->
                <div style="display: flex;">
                    <!-- Left Sidebar -->
                    <div style="width: 250px; border-right: 2px solid #000; min-height: 450px; background: #fff;">
                        <a href="#search" style="display: block; padding: 15px; border-bottom: 2px solid #000; color: black; text-decoration: none; font-weight: bold; font-size: 0.95rem; ${activeHash === '#search' ? 'background: #cbd5e1;' : ''}">Is book available?</a>
                        <a href="#issue" style="display: block; padding: 15px; border-bottom: 2px solid #000; color: black; text-decoration: none; font-weight: bold; font-size: 0.95rem; ${activeHash === '#issue' ? 'background: #cbd5e1;' : ''}">Issue book?</a>
                        <a href="#return" style="display: block; padding: 15px; border-bottom: 2px solid #000; color: black; text-decoration: none; font-weight: bold; font-size: 0.95rem; ${activeHash === '#return' ? 'background: #cbd5e1;' : ''}">Return book?</a>
                        <a href="#fine" style="display: block; padding: 15px; border-bottom: none; color: black; text-decoration: none; font-weight: bold; font-size: 0.95rem; ${activeHash === '#fine' ? 'background: #cbd5e1;' : ''}">Pay Fine?</a>
                    </div>

                    <!-- Right Main Content -->
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <div style="border-bottom: 2px solid #000; padding: 8px 15px; font-weight: bold; text-align: left; background: #fff; font-size: 1.1rem; text-decoration: underline;">${contentTitle}</div>
                        <div style="flex: 1; background: #fdfdfd;">
                            ${contentHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
new App();
