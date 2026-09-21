// Basic client-side auth helpers (demo only, not secure for production)
(function () {
  function getUsers() {
    try { return JSON.parse(localStorage.getItem('users') || '[]'); } catch (e) { return []; }
  }
  function setUsers(users) { localStorage.setItem('users', JSON.stringify(users)); }
  function getCurrentUser() { try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch(e){ return null; } }
  function setCurrentUser(user) { localStorage.setItem('currentUser', JSON.stringify(user)); }

  function ensureDefaultAdmin() {
    const users = getUsers();
    if (!users.find(u => u.role === 'admin')) {
      users.push({ id: 'admin-1', name: 'Administrator', email: 'admin@tchop.local', password: btoa('admin123'), role: 'admin' });
      // add a sample client so admin has someone to see
      users.push({ id: 'client-1', name: 'Jean', email: 'jean@example.com', password: btoa('password'), role: 'client' });
      setUsers(users);
    }
  }

  function registerUser(name, email, password) {
    const users = getUsers();
    if (users.find(u => u.email === email)) return { ok: false, error: 'Email already registered' };
    const id = 'user-' + Date.now();
    users.push({ id, name, email, password: btoa(password), role: 'client' });
    setUsers(users);
    return { ok: true, user: { id, name, email, role: 'client' } };
  }

  function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === btoa(password));
    if (!user) return { ok: false, error: 'Invalid credentials' };
    setCurrentUser({ id: user.id, name: user.name, email: user.email, role: user.role });
    return { ok: true, user };
  }

  // Attach to window for pages to use
  window.Auth = {
    getUsers,
    setUsers,
    getCurrentUser,
    setCurrentUser,
    ensureDefaultAdmin,
    registerUser,
    loginUser
  };

  // Ensure admin on load so admin page has at least one admin
  document.addEventListener('DOMContentLoaded', ensureDefaultAdmin);
})();
