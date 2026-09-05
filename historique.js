/*function verifierAcces() {
  const sessionData = localStorage.getItem('chan_session');
  if (!sessionData) {
    window.location.href = 'login.html';
    return null;
  }
  return JSON.parse(sessionData);
}

document.addEventListener('DOMContentLoaded', () => {
  const user = verifierAcces();
  if (user) {
    document.getElementById('user-name').textContent = user.nom || 'Utilisateur';
    document.getElementById('user-role').textContent = user.service === 'SUPERIEUR' ? 'Accès Direction Supérieure' : 'Responsable Odontologie';
  }

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('chan_session');
      window.location.href = 'login.html';
    });
  }

  // Récupération des données depuis le localStorage
  const demandes = JSON.parse(localStorage.getItem('demandes_odontologie')) || [];

  const tbody = document.getElementById('tbody-historique');
  const searchInput = document.getElementById('search-input');
  const filterStatut = document.getElementById('filter-statut');
  const filterUrgence = document.getElementById('filter-urgence');
  const totalCount = document.getElementById('total-count');

  // Fonction d'affichage du tableau
  function afficherDemandes(liste) {
    tbody.innerHTML = '';
    totalCount.textContent = liste.length;

    if (liste.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #64748b; padding: 20px;">Aucune demande trouvée.</td></tr>`;
      return;
    }

    liste.forEach((item) => {
      const tr = document.createElement('tr');

      // Badge d'urgence
      let classUrgence = 'badge-other';
      if (item.urgence === 'Critique') classUrgence = 'badge-red';
      else if (item.urgence === 'Moyenne') classUrgence = 'badge-purple';
      else if (item.urgence === 'Faible') classUrgence = 'badge-blue';

      // Badge de statut
      let classStatut = 'badge-other';
      if (item.statut === 'En attente') classStatut = 'badge-red';
      else if (item.statut === 'En cours') classStatut = 'badge-purple';
      else if (item.statut === 'Traité') classStatut = 'badge-green';

      tr.innerHTML = `
        <td><strong>${item.id}</strong></td>
        <td>${item.date || '-'}</td>
        <td>${item.demandeur || '-'}</td>
        <td><strong>${item.appareil || '-'}</strong></td>
        <td>${item.typePanne || '-'}</td>
        <td><span class="badge ${classUrgence}">${item.urgence || '-'}</span></td>
        <td><span class="badge ${classStatut}">${item.statut || 'En attente'}</span></td>
        <td title="${item.description}">${item.description ? item.description.substring(0, 45) + (item.description.length > 45 ? '...' : '') : '-'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Fonction de filtrage automatique
  function filtrer() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedStatut = filterStatut.value;
    const selectedUrgence = filterUrgence.value;

    const resultats = demandes.filter((item) => {
      const matchText = (
        (item.id && item.id.toLowerCase().includes(query)) ||
        (item.appareil && item.appareil.toLowerCase().includes(query)) ||
        (item.demandeur && item.demandeur.toLowerCase().includes(query)) ||
        (item.typePanne && item.typePanne.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.date && item.date.includes(query))
      );

      const matchStatut = selectedStatut === '' || item.statut === selectedStatut;
      const matchUrgence = selectedUrgence === '' || item.urgence === selectedUrgence;

      return matchText && matchStatut && matchUrgence;
    });

    afficherDemandes(resultats);
  }

  // Événements pour la recherche instantanée
  searchInput.addEventListener('input', filtrer);
  filterStatut.addEventListener('change', filtrer);
  filterUrgence.addEventListener('change', filtrer);

  // Premier affichage initial
  afficherDemandes(demandes);
});
*/


//INTEGRATION BD EN LIGNE 

function verifierAcces() {
  const sessionData = localStorage.getItem('chan_session');
  if (!sessionData) {
    window.location.href = 'login.html';
    return null;
  }
  return JSON.parse(sessionData);
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = verifierAcces();
  if (user) {
    document.getElementById('user-name').textContent = user.nom || 'Utilisateur';
    document.getElementById('user-role').textContent = user.service === 'SUPERIEUR' ? 'Accès Direction Supérieure' : 'Responsable Odontologie';
  }

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('chan_session');
      window.location.href = 'login.html';
    });
  }

  const tbody = document.getElementById('tbody-historique');
  const searchInput = document.getElementById('search-input');
  const filterStatut = document.getElementById('filter-statut');
  const filterUrgence = document.getElementById('filter-urgence');
  const totalCount = document.getElementById('total-count');

  let demandes = [];

  // Fonction de chargement depuis Supabase
  async function chargerDemandes() {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #64748b; padding: 20px;">Chargement des données...</td></tr>`;

    try {
      const { data, error } = await _supabase
        .from('demandes')
        .select('*')
        .eq('service', 'Odontologie')
        .order('created_at', { ascending: false });

      if (error) throw error;

      demandes = data || [];
      filtrer();
    } catch (err) {
      console.error('Erreur lors de la récupération Supabase :', err.message);
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #dc2626; padding: 20px;">Erreur de chargement des données.</td></tr>`;
    }
  }

  // Fonction d'affichage du tableau
  function afficherDemandes(liste) {
    tbody.innerHTML = '';
    totalCount.textContent = liste.length;

    if (liste.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #64748b; padding: 20px;">Aucune demande trouvée.</td></tr>`;
      return;
    }

    liste.forEach((item) => {
      const tr = document.createElement('tr');

      // Badge d'urgence
      let classUrgence = 'badge-other';
      if (item.urgence === 'Critique') classUrgence = 'badge-red';
      else if (item.urgence === 'Moyenne') classUrgence = 'badge-purple';
      else if (item.urgence === 'Faible') classUrgence = 'badge-blue';

      // Badge de statut
      let classStatut = 'badge-other';
      if (item.statut === 'En attente') classStatut = 'badge-red';
      else if (item.statut === 'En cours') classStatut = 'badge-purple';
      else if (item.statut === 'Traité') classStatut = 'badge-green';

      const typePanneAffichage = item.type_panne || item.typePanne || '-';

      tr.innerHTML = `
        <td><strong>${item.id}</strong></td>
        <td>${item.date || '-'}</td>
        <td>${item.demandeur || '-'}</td>
        <td><strong>${item.appareil || '-'}</strong></td>
        <td>${typePanneAffichage}</td>
        <td><span class="badge ${classUrgence}">${item.urgence || '-'}</span></td>
        <td><span class="badge ${classStatut}">${item.statut || 'En attente'}</span></td>
        <td title="${item.description}">${item.description ? item.description.substring(0, 45) + (item.description.length > 45 ? '...' : '') : '-'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Fonction de filtrage automatique
  function filtrer() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedStatut = filterStatut.value;
    const selectedUrgence = filterUrgence.value;

    const resultats = demandes.filter((item) => {
      const typePanneAffichage = item.type_panne || item.typePanne || '';
      const matchText = (
        (item.id && item.id.toLowerCase().includes(query)) ||
        (item.appareil && item.appareil.toLowerCase().includes(query)) ||
        (item.demandeur && item.demandeur.toLowerCase().includes(query)) ||
        (typePanneAffichage && typePanneAffichage.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.date && item.date.includes(query))
      );

      const matchStatut = selectedStatut === '' || item.statut === selectedStatut;
      const matchUrgence = selectedUrgence === '' || item.urgence === selectedUrgence;

      return matchText && matchStatut && matchUrgence;
    });

    afficherDemandes(resultats);
  }

  // Événements pour la recherche instantanée
  searchInput.addEventListener('input', filtrer);
  filterStatut.addEventListener('change', filtrer);
  filterUrgence.addEventListener('change', filtrer);

  // Synchronisation en temps réel avec Supabase Realtime
  _supabase
    .channel('public:demandes_historique')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'demandes' }, () => {
      chargerDemandes();
    })
    .subscribe();

  // Premier affichage depuis la base de données
  chargerDemandes();
});
