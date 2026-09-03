function verifierAcces() {
    const sessionData = localStorage.getItem('chan_session');
    if (!sessionData) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(sessionData);
}

document.addEventListener('DOMContentLoaded', () => {
    const user = verifierAcces();
    if (!user) return;

    document.getElementById('user-name').textContent = user.nom;
    document.getElementById('user-role').textContent = user.service === 'SUPERIEUR' ? 'Accès Direction Supérieure' : 'Responsable Odontologie';

    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('chan_session');
        window.location.href = 'login.html';
    });
});