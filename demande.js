/*
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
    
    // Remplir automatiquement la date du jour et le demandeur
    document.getElementById('date-demande').valueToDate = new Date();
    document.getElementById('date-demande').value = new Date().toISOString().split('T')[0];
    document.getElementById('demandeur').value = user.nom;

    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('chan_session');
        window.location.href = 'login.html';
    });

    document.getElementById('form-intervention').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Votre demande d\'intervention a été transmise avec succès au service technique.');
        window.location.href = 'materiel.html';
    });
});
*/

/*document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-demande");
  const notif = document.getElementById("notification-box");
  const dateInput = document.getElementById("date_demande");

  // Définir la date du jour par défaut
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // 1. Récupération des données
    const nouvelleDemande = {
      id: "DEM-" + Date.now(),
      date: dateInput.value,
      appareil: document.getElementById("appareil").value.trim(),
      demandeur: document.getElementById("demandeur").value.trim(),
      priorite: document.getElementById("priorite").value,
      description: document.getElementById("description").value.trim(),
      statut: "En attente", // Statut initial
      secteur: "Non assigné",
      technicien: "Non assigné"
    };

    // 2. Sauvegarde dans localStorage
    const demandesExistantes = JSON.parse(localStorage.getItem("demandes_odontologie")) || [];
    demandesExistantes.unshift(nouvelleDemande);
    localStorage.setItem("demandes_odontologie", JSON.stringify(demandesExistantes));

    // 3. Notification & Redirection
    notif.style.display = "block";
    form.reset();

    setTimeout(() => {
      window.location.href = "suivi_maintenance.html";
    }, 1500);
  });
});*/

/*
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
  
  // Affichage des informations utilisateur
  if (user) {
    const nameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');
    const demandeurInput = document.getElementById('demandeur');

    if (nameEl) nameEl.textContent = user.nom || 'Utilisateur';
    if (roleEl) roleEl.textContent = user.service === 'SUPERIEUR' ? 'Accès Direction Supérieure' : 'Responsable Odontologie';
    if (demandeurInput && !demandeurInput.value) demandeurInput.value = user.nom || '';
  }

  // Date du jour par défaut
  const dateInput = document.getElementById('date-demande');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Déconnexion
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('chan_session');
      window.location.href = 'login.html';
    });
  }

  // Soumission du formulaire
  const form = document.getElementById('form-intervention');
  const notif = document.getElementById('notification-box');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Récupération sécurisée des valeurs
      const nouvelleDemande = {
        id: 'DEM-' + Date.now(),
        service: 'Odontologie',
        date: document.getElementById('date-demande').value,
        demandeur: document.getElementById('demandeur').value.trim(),
        appareil: document.getElementById('appareil').value,
        typePanne: document.getElementById('type-panne').value,
        urgence: document.getElementById('niveau-urgence').value,
        description: document.getElementById('description').value.trim(),
        statut: 'En attente',
        secteur: 'Non assigné',
        technicien: 'Non assigné',
        createdAt: new Date().toISOString()
      };

      // Sauvegarde partagée dans le localStorage
      const demandesExistantes = JSON.parse(localStorage.getItem('demandes_odontologie')) || [];
      demandesExistantes.unshift(nouvelleDemande);
      localStorage.setItem('demandes_odontologie', JSON.stringify(demandesExistantes));

      // Affichage de la notification
      if (notif) {
        notif.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      form.reset();
      
      // Réinitialisation de la date après le reset
      if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
      if (user && document.getElementById('demandeur')) {
        document.getElementById('demandeur').value = user.nom || '';
      }

      // Masquage automatique du message après 4 secondes
      setTimeout(() => {
        if (notif) notif.style.display = 'none';
      }, 4000);
    });
  }
});

*/

//version interconnection maintenance et odontologie

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
  
  // Affichage des informations utilisateur
  if (user) {
    const nameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');
    const demandeurInput = document.getElementById('demandeur');

    if (nameEl) nameEl.textContent = user.nom || 'Utilisateur';
    if (roleEl) roleEl.textContent = user.service === 'SUPERIEUR' ? 'Accès Direction Supérieure' : 'Responsable Odontologie';
    if (demandeurInput && !demandeurInput.value) demandeurInput.value = user.nom || '';
  }

  // Date du jour par défaut
  const dateInput = document.getElementById('date-demande');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Déconnexion
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('chan_session');
      window.location.href = 'login.html';
    });
  }

  // Soumission du formulaire
  const form = document.getElementById('form-intervention');
  const notif = document.getElementById('notification-box');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Récupération des valeurs
      const nouvelleDemande = {
        id: 'DEM-' + Date.now(),
        service: 'Odontologie',
        date: document.getElementById('date-demande').value,
        demandeur: document.getElementById('demandeur').value.trim(),
        appareil: document.getElementById('appareil').value,
        typePanne: document.getElementById('type-panne').value,
        urgence: document.getElementById('niveau-urgence').value,
        description: document.getElementById('description').value.trim(),
        statut: 'En attente', // Format unifié
        secteur: 'Non assigné',
        technicienNom: 'Non assigné',
        createdAt: new Date().toISOString()
      };

      // 1. Sauvegarde pour l'espace Maintenance
      const demandesMaint = JSON.parse(localStorage.getItem('chan_demandes') || '[]');
      demandesMaint.unshift(nouvelleDemande);
      localStorage.setItem('chan_demandes', JSON.stringify(demandesMaint));

      // 2. Sauvegarde pour l'historique Odontologie
      const demandesOdonto = JSON.parse(localStorage.getItem('demandes_odontologie') || '[]');
      demandesOdonto.unshift(nouvelleDemande);
      localStorage.setItem('demandes_odontologie', JSON.stringify(demandesOdonto));

      // Affichage de la notification
      if (notif) {
        notif.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      form.reset();
      
      // Réinitialisation des champs par défaut
      if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
      if (user && document.getElementById('demandeur')) {
        document.getElementById('demandeur').value = user.nom || '';
      }

      // Masquage automatique du message après 4 secondes
      setTimeout(() => {
        if (notif) notif.style.display = 'none';
      }, 4000);
    });
  }
});