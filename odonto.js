/*
// =============================================================
// VÉRIFICATION DE LA SESSION ET SÉCURITÉ ACCÈS
// =============================================================
const sessionData = JSON.parse(localStorage.getItem('chan_session'));

// 1. Si non connecté -> Retour au login
if (!sessionData) {
    window.location.href = 'login.html';
} 
// 2. Sécurité : Seul Odontologie ou TOUS (Direction/Maintenance) peut lire cette page
else if (sessionData.service !== 'Odontologie' && sessionData.service !== 'TOUS' && sessionData.service !== 'SUPERIEUR') {
    alert("Accès non autorisé pour ce service.");
    window.location.href = 'login.html';
}

// Données fictives dédiées exclusivement à l'Odontologie
const pannesOdonto = [
    { id: 'OD-101', date: '2026-03-01', type: 'Fauteuil Dentaire', technicien: 'P1', statut: 'Résolu' },
    { id: 'OD-102', date: '2026-03-02', type: 'Compresseur', technicien: 'P3', statut: 'En Cours' },
    { id: 'OD-103', date: '2026-03-03', type: 'Électrique', technicien: 'P2', statut: 'Résolu' },
    { id: 'OD-104', date: '2026-03-04', type: 'Plomberie', technicien: 'P4', statut: 'En Attente' },
    { id: 'OD-105', date: '2026-03-05', type: 'Fauteuil Dentaire', technicien: 'P1', statut: 'Résolu' }
];

document.addEventListener('DOMContentLoaded', () => {
    // Affichage des informations utilisateur
    const userDisplay = document.getElementById('user-display');
    if (userDisplay && sessionData) {
        userDisplay.textContent = `${sessionData.nom} (${sessionData.service})`;
    }

    // Gestion de la Déconnexion
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('chan_session');
            window.location.href = 'login.html';
        });
    }

    // Calculs et affichage
    chargerKPIs();
    afficherTableau();
    initialiserGraphique();
});

function chargerKPIs() {
    const total = pannesOdonto.length;
    const resolu = pannesOdonto.filter(p => p.statut === 'Résolu').length;
    const encours = pannesOdonto.filter(p => p.statut === 'En Cours').length;

    document.getElementById('kpi-total').textContent = total;
    document.getElementById('kpi-resolu').textContent = resolu;
    document.getElementById('kpi-encours').textContent = encours;
}

function afficherTableau() {
    const tbody = document.getElementById('table-odonto');
    tbody.innerHTML = '';

    pannesOdonto.forEach(item => {
        let badgeClass = 'badge-resolu';
        if (item.statut === 'En Cours') badgeClass = 'badge-encours';
        if (item.statut === 'En Attente') badgeClass = 'badge-attente';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.id}</strong></td>
            <td>${item.date}</td>
            <td>${item.type}</td>
            <td>${item.technicien}</td>
            <td><span class="badge ${badgeClass}">${item.statut}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function initialiserGraphique() {
    const compteurs = {};
    pannesOdonto.forEach(p => {
        compteurs[p.type] = (compteurs[p.type] || 0) + 1;
    });

    const ctx = document.getElementById('chartOdonto').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(compteurs),
            datasets: [{
                label: 'Pannes',
                data: Object.values(compteurs),
                backgroundColor: '#f59e0b',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}
    */

/*UPLOAD PAGE*/

/*
// --- 1. SÉCURITÉ ET RESTRICTION D'ACCÈS ---
function verifierAcces() {
    const sessionData = localStorage.getItem('chan_session');
    
    // Si non connecté -> Redirection Login
    if (!sessionData) {
        window.location.href = 'login.html';
        return null;
    }

    const user = JSON.parse(sessionData);

    // Droits autorisés : Odontologie, Supérieur, ou Direction (TOUS)
    const servicesAutorises = ['Odontologie', 'SUPERIEUR', 'TOUS'];

    if (!servicesAutorises.includes(user.service)) {
        alert(`Accès refusé. Le profil ${user.nom} (${user.service}) n'a pas accès au service d'Odontologie.`);
        
        // Redirection vers sa page dédiée
        const redirections = {
            'Urgences': 'urgences.html',
            'Maternité': 'maternite.html',
            'Pédiatrie': 'pediatrie.html',
            'Bloc Opératoire': 'bloc.html'
        };
        
        window.location.href = redirections[user.service] || 'index.html';
        return null;
    }

    return user;
}

// --- 2. GÉNÉRATEUR DE BASE DE DONNÉES ALÉATOIRE (500 OBSERVATIONS) ---
function genererBaseOdonto(nbLignes = 500) {
    const prenomsM = ["Mamadou", "Ousmane", "Abdoulaye", "Ibrahima", "Cheikh", "Modou", "Babacar", "Alioune", "Samba", "Moussa", "Demba", "Tidiane"];
    const prenomsF = ["Aïssatou", "Fatou", "Mariama", "Khady", "Aminata", "Ndèye", "Khadija", "Coumba", "Sokhna", "Binta", "Astou", "Mame"];
    const noms = ["Diallo", "Sow", "Ndiaye", "Kane", "Ba", "Fall", "Sarr", "Cissé", "Diop", "Wade", "Gaye", "Sy", "Faye", "Mbaye", "Thiam"];
    
    const actesList = [
        { acte: "Extraction", diag: ["Délabrement coronaire irréversible", "Inclusion dentaire douloureuse", "Mobilité dentaire stade 3", "Fracture dentaire"] },
        { acte: "Obturation composite", diag: ["Caries dentaires pénétrantes", "Reprise de carie", "Caries esthétiques antérieures", "Érosion amélaire"] },
        { acte: "Détartrage", diag: ["Tartre sous-gingival & Gingivite", "Soins d'hygiène préventifs", "Saignement gingival spontané"] },
        { acte: "Consultation", diag: ["Pulpite aiguë", "Bilan bucco-dentaire annuel", "Avis spécialisé odontologie", "Consultation de contrôle"] }
    ];

    const dentsDispo = ["11", "12", "13", "16", "21", "26", "36", "38", "46", "47", "Arcades", "11, 21", "36, 37", "45, 46"];
    
    const registreGenerer = [];

    for (let i = 1; i <= nbLignes; i++) {
        const sexe = Math.random() > 0.5 ? "M" : "F";
        const prenom = sexe === "M" 
            ? prenomsM[Math.floor(Math.random() * prenomsM.length)] 
            : prenomsF[Math.floor(Math.random() * prenomsF.length)];
        const nom = noms[Math.floor(Math.random() * noms.length)];
        
        // Génération d'une date aléatoire entre Janvier et Juillet 2026
        const mois = String(Math.floor(Math.random() * 7) + 1).padStart(2, '0');
        const jour = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const dateStr = `${jour}/${mois}/2026`;

        // Choix de l'acte et diagnostic correspondant
        const groupeActe = actesList[Math.floor(Math.random() * actesList.length)];
        const diagnostic = groupeActe.diag[Math.floor(Math.random() * groupeActe.diag.length)];

        // Numéro de registre formaté (ex: REG-0001, REG-0500)
        const numRegistre = `REG-${String(i).padStart(4, '0')}`;

        registreGenerer.push({
            date: dateStr,
            registre: numRegistre,
            patient: `${prenom} ${nom}`,
            age: Math.floor(Math.random() * 60) + 12, // Âges entre 12 et 72 ans
            sexe: sexe,
            dents: dentsDispo[Math.floor(Math.random() * dentsDispo.length)],
            acte: groupeActe.acte,
            diagnostic: diagnostic
        });
    }

    return registreGenerer;
}

// Génération automatique des 500 données au démarrage
const registreOdonto = genererBaseOdonto(500);

// --- 3. CHARGEMENT ET INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    const user = verifierAcces();
    if (!user) return; // Stoppe l'exécution si accès non autorisé

    // Affichage des informations utilisateur
    document.getElementById('user-name').textContent = user.nom;
    document.getElementById('user-role').textContent = user.service === 'SUPERIEUR' ? 'Accès Direction Supérieure' : 'Responsable Odontologie';

    // Gestion de la déconnexion
    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('chan_session');
        window.location.href = 'login.html';
    });

    // Initialisation du tableau de bord
    calculerKPIs(registreOdonto);
    afficherTableau(registreOdonto);
    initGraphiques(registreOdonto);

    // Recherche et filtres dynamique
    document.getElementById('search-input').addEventListener('input', filtrerRegistre);
    document.getElementById('filter-acte').addEventListener('change', filtrerRegistre);
});

// --- 4. CALCUL DES KPIS ---
function calculerKPIs(data) {
    document.getElementById('kpi-total-consultations').textContent = data.length;

    const extractions = data.filter(d => d.acte.toLowerCase().includes('extraction')).length;
    document.getElementById('kpi-extractions').textContent = extractions;

    const soins = data.filter(d => d.acte.toLowerCase().includes('composite') || d.acte.toLowerCase().includes('obturation')).length;
    document.getElementById('kpi-soins').textContent = soins;

    const detartrages = data.filter(d => d.acte.toLowerCase().includes('détartrage')).length;
    document.getElementById('kpi-detartrages').textContent = detartrages;
}

// --- 5. AFFICHAGE DU TABLEAU ---
function afficherTableau(data) {
    const tbody = document.getElementById('registre-tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px;">Aucun registre trouvé.</td></tr>`;
        return;
    }

    // Affichage des résultats
    data.forEach(item => {
        const tr = document.createElement('tr');
        
        let badgeClass = 'badge-other';
        if (item.acte.includes('Extraction')) badgeClass = 'badge-red';
        else if (item.acte.includes('composite')) badgeClass = 'badge-green';
        else if (item.acte.includes('Détartrage')) badgeClass = 'badge-purple';
        else if (item.acte.includes('Consultation')) badgeClass = 'badge-blue';

        tr.innerHTML = `
            <td><strong>${item.date}</strong></td>
            <td><code>${item.registre}</code></td>
            <td><strong>${item.patient}</strong></td>
            <td>${item.age} ans</td>
            <td><span class="gender-tag ${item.sexe}">${item.sexe}</span></td>
            <td>${item.dents}</td>
            <td><span class="badge ${badgeClass}">${item.acte}</span></td>
            <td>${item.diagnostic}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- 6. FILTRES ET RECHERCHE ---
function filtrerRegistre() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const filter = document.getElementById('filter-acte').value;

    const resultats = registreOdonto.filter(item => {
        const matchSearch = item.patient.toLowerCase().includes(search) ||
                            item.registre.toLowerCase().includes(search) ||
                            item.dents.toLowerCase().includes(search) ||
                            item.diagnostic.toLowerCase().includes(search);

        const matchFilter = (filter === 'TOUS') || item.acte.toLowerCase().includes(filter.toLowerCase());

        return matchSearch && matchFilter;
    });

    // Mettre à jour le tableau et recalculer les graphiques/KPIs en fonction du filtre
    afficherTableau(resultats);
    calculerKPIs(resultats);
}

// --- 7. GRAPHIQUES (CHART.JS) ---
let chartActesInstance = null;
let chartSexeInstance = null;

function initGraphiques(data) {
    // Nettoyage des instances précédentes si existantes
    if (chartActesInstance) chartActesInstance.destroy();
    if (chartSexeInstance) chartSexeInstance.destroy();

    // Graphique 1 : Par Type d'Actes
    const nbExtractions = data.filter(d => d.acte.includes('Extraction')).length;
    const nbSoins = data.filter(d => d.acte.includes('composite')).length;
    const nbDetartrage = data.filter(d => d.acte.includes('Détartrage')).length;
    const nbConsult = data.filter(d => d.acte.includes('Consultation')).length;

    const ctxActes = document.getElementById('chartActes').getContext('2d');
    chartActesInstance = new Chart(ctxActes, {
        type: 'bar',
        data: {
            labels: ['Extractions', 'Composites / Soins', 'Détartrages', 'Consultations'],
            datasets: [{
                label: "Nombre d'actes",
                data: [nbExtractions, nbSoins, nbDetartrage, nbConsult],
                backgroundColor: ['#ef4444', '#10b981', '#8b5cf6', '#3b82f6'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });

    // Graphique 2 : Par Sexe
    const nbHommes = data.filter(d => d.sexe === 'M').length;
    const nbFemmes = data.filter(d => d.sexe === 'F').length;

    const ctxSexe = document.getElementById('chartSexe').getContext('2d');
    chartSexeInstance = new Chart(ctxSexe, {
        type: 'doughnut',
        data: {
            labels: ['Hommes (M)', 'Femmes (F)'],
            datasets: [{
                data: [nbHommes, nbFemmes],
                backgroundColor: ['#0284c7', '#ec4899']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}*/

// --- 1. SÉCURITÉ ET RESTRICTION D'ACCÈS ---
function verifierAcces() {
    const sessionData = localStorage.getItem('chan_session');
    
    if (!sessionData) {
        window.location.href = 'login.html';
        return null;
    }

    const user = JSON.parse(sessionData);
    const servicesAutorises = ['Odontologie', 'SUPERIEUR', 'TOUS'];

    if (!servicesAutorises.includes(user.service)) {
        alert(`Accès refusé. Le profil ${user.nom} (${user.service}) n'a pas accès au service d'Odontologie.`);
        
        const redirections = {
            'Urgences': 'urgences.html',
            'Maternité': 'maternite.html',
            'Pédiatrie': 'pediatrie.html',
            'Bloc Opératoire': 'bloc.html'
        };
        
        window.location.href = redirections[user.service] || 'index.html';
        return null;
    }

    return user;
}

// --- 2. GENERATEUR DE DONNÉES ALÉATOIRES AVEC ADRESSE (500 OBSERVATIONS) ---
function genererBaseOdonto(nbLignes = 983) {
    const prenomsM = ["Mamadou", "Ousmane", "Abdoulaye", "Ibrahima", "Cheikh", "Modou", "Babacar", "Alioune", "Samba", "Moussa", "Demba", "Tidiane"];
    const prenomsF = ["Aïssatou", "Fatou", "Mariama", "Khady", "Aminata", "Ndèye", "Khadija", "Coumba", "Sokhna", "Binta", "Astou", "Mame"];
    const noms = ["Diallo", "Sow", "Ndiaye", "Kane", "Ba", "Fall", "Sarr", "Cissé", "Diop", "Wade", "Gaye", "Sy", "Faye", "Mbaye", "Thiam"];
    
    // Intégration de la variable Adresse
    const adresses = ["Médina", "Fann", "Grand Yoff", "Parcelles Assainies", "HLM", "Mermoz", "Ouakam", "Guediawaye", "Pikine", "Rufisque", "Thiaroy", "Randoulène"];

    const actesList = [
        { acte: "Extraction", diag: ["Délabrement coronaire irréversible", "Inclusion dentaire douloureuse", "Mobilité dentaire stade 3", "Fracture dentaire"] },
        { acte: "Obturation composite", diag: ["Caries dentaires pénétrantes", "Reprise de carie", "Caries esthétiques antérieures", "Érosion amélaire"] },
        { acte: "Détartrage", diag: ["Tartre sous-gingival & Gingivite", "Soins d'hygiène préventifs", "Saignement gingival spontané"] },
        { acte: "Consultation", diag: ["Pulpite aiguë", "Bilan bucco-dentaire annuel", "Avis spécialisé odontologie", "Consultation de contrôle"] }
    ];

    const dentsDispo = ["11", "12", "13", "16", "21", "26", "36", "38", "46", "47", "Arcades", "11, 21", "36, 37", "45, 46"];
    const registreGenerer = [];

    // Définition d'une période de dates croissantes (Janvier à Mai 2026)
    const dateDebut = new Date(2026, 0, 1);

    for (let i = 1; i <= nbLignes; i++) {
        const sexe = Math.random() > 0.5 ? "M" : "F";
        const prenom = sexe === "M" 
            ? prenomsM[Math.floor(Math.random() * prenomsM.length)] 
            : prenomsF[Math.floor(Math.random() * prenomsF.length)];
        const nom = noms[Math.floor(Math.random() * noms.length)];
        const adresse = adresses[Math.floor(Math.random() * adresses.length)];

        // Génération de dates ISO (YYYY-MM-DD) pour faciliter le filtrage
        const dateObj = new Date(dateDebut.getTime() + Math.floor(Math.random() * 120) * 24 * 60 * 60 * 1000);
        const isoDate = dateObj.toISOString().split('T')[0];

        const groupeActe = actesList[Math.floor(Math.random() * actesList.length)];
        const diagnostic = groupeActe.diag[Math.floor(Math.random() * groupeActe.diag.length)];

        registreGenerer.push({
            date: isoDate,
            registre: `REG-${String(i).padStart(4, '0')}`,
            patient: `${prenom} ${nom}`,
            age: Math.floor(Math.random() * 65) + 8, // De 8 à 73 ans
            sexe: sexe,
            adresse: adresse,
            dents: dentsDispo[Math.floor(Math.random() * dentsDispo.length)],
            acte: groupeActe.acte,
            diagnostic: diagnostic
        });
    }

    // Trier les données de la plus récente à la plus ancienne
    return registreGenerer.sort((a, b) => new Date(b.date) - new Date(a.date));
}

const registreOdonto = genererBaseOdonto(983);

// --- 3. INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    const user = verifierAcces();
    if (!user) return;

    document.getElementById('user-name').textContent = user.nom;
    document.getElementById('user-role').textContent = user.service === 'SUPERIEUR' ? 'Accès Direction Supérieure' : 'Responsable Odontologie';

    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('chan_session');
        window.location.href = 'login.html';
    });

    // Chargement initial des vues
    mettreAJourPage(registreOdonto);

    // Écouteurs sur tous les filtres
    document.getElementById('search-input').addEventListener('input', filtrerTousRegistre);
    document.getElementById('filter-date-start').addEventListener('change', filtrerTousRegistre);
    document.getElementById('filter-date-end').addEventListener('change', filtrerTousRegistre);
    document.getElementById('filter-genre').addEventListener('change', filtrerTousRegistre);
    document.getElementById('filter-age').addEventListener('change', filtrerTousRegistre);
    document.getElementById('filter-acte').addEventListener('change', filtrerTousRegistre);

    // Bouton de réinitialisation
    document.getElementById('btn-reset-filters').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        document.getElementById('filter-date-start').value = '';
        document.getElementById('filter-date-end').value = '';
        document.getElementById('filter-genre').value = 'TOUS';
        document.getElementById('filter-age').value = 'TOUS';
        document.getElementById('filter-acte').value = 'TOUS';
        mettreAJourPage(registreOdonto);
    });
});

// --- 4. FILTRAGE MULTI-CRITÈRES AVANCÉ ---
function filtrerTousRegistre() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const dateStart = document.getElementById('filter-date-start').value;
    const dateEnd = document.getElementById('filter-date-end').value;
    const genre = document.getElementById('filter-genre').value;
    const ageGroup = document.getElementById('filter-age').value;
    const acte = document.getElementById('filter-acte').value;

    const resultats = registreOdonto.filter(item => {
        // Recherche textuelle
        const matchSearch = item.patient.toLowerCase().includes(search) ||
                            item.registre.toLowerCase().includes(search) ||
                            item.adresse.toLowerCase().includes(search) ||
                            item.dents.toLowerCase().includes(search) ||
                            item.diagnostic.toLowerCase().includes(search);

        // Date
        const matchStart = dateStart ? item.date >= dateStart : true;
        const matchEnd = dateEnd ? item.date <= dateEnd : true;

        // Genre
        const matchGenre = (genre === 'TOUS') || (item.sexe === genre);

        // Tranche d'âge
        let matchAge = true;
        if (ageGroup === 'enfant') matchAge = item.age < 18;
        else if (ageGroup === 'jeune') matchAge = item.age >= 18 && item.age <= 35;
        else if (ageGroup === 'adulte') matchAge = item.age >= 36 && item.age <= 55;
        else if (ageGroup === 'senior') matchAge = item.age > 55;

        // Acte
        const matchActe = (acte === 'TOUS') || item.acte.toLowerCase().includes(acte.toLowerCase());

        return matchSearch && matchStart && matchEnd && matchGenre && matchAge && matchActe;
    });

    mettreAJourPage(resultats);
}

function mettreAJourPage(data) {
    calculerKPIs(data);
    afficherTableau(data);
    initGraphiques(data);
}

// --- 5. CALCUL DES KPIS ---
function calculerKPIs(data) {
    document.getElementById('kpi-total-consultations').textContent = data.length;
    document.getElementById('kpi-extractions').textContent = data.filter(d => d.acte.toLowerCase().includes('extraction')).length;
    document.getElementById('kpi-soins').textContent = data.filter(d => d.acte.toLowerCase().includes('composite') || d.acte.toLowerCase().includes('obturation')).length;
    document.getElementById('kpi-detartrages').textContent = data.filter(d => d.acte.toLowerCase().includes('détartrage')).length;
}

// --- 6. AFFICHAGE TABLEAU ---
function afficherTableau(data) {
    const tbody = document.getElementById('registre-tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 20px; color: #64748b;">Aucune consultation trouvée selon vos filtres.</td></tr>`;
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');
        let badgeClass = 'badge-other';
        if (item.acte.includes('Extraction')) badgeClass = 'badge-red';
        else if (item.acte.includes('composite')) badgeClass = 'badge-green';
        else if (item.acte.includes('Détartrage')) badgeClass = 'badge-purple';
        else if (item.acte.includes('Consultation')) badgeClass = 'badge-blue';

        // Formatage de la date en français (JJ/MM/AAAA)
        const [yyyy, mm, dd] = item.date.split('-');
        const dateFR = `${dd}/${mm}/${yyyy}`;

        tr.innerHTML = `
            <td><strong>${dateFR}</strong></td>
            <td><code>${item.registre}</code></td>
            <td><strong>${item.patient}</strong></td>
            <td>${item.age} ans</td>
            <td><span class="gender-tag ${item.sexe}">${item.sexe}</span></td>
            <td>${item.adresse}</td>
            <td>${item.dents}</td>
            <td><span class="badge ${badgeClass}">${item.acte}</span></td>
            <td>${item.diagnostic}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- 7. GRAPHIQUES ET COURBE D'ÉVOLUTION TEMPORELLE ---
let chartEvolutionInstance = null;
let chartActesInstance = null;
let chartSexeInstance = null;

function initGraphiques(data) {
    if (chartEvolutionInstance) chartEvolutionInstance.destroy();
    if (chartActesInstance) chartActesInstance.destroy();
    if (chartSexeInstance) chartSexeInstance.destroy();

    // 1. COURBE D'ÉVOLUTION TEMPORELLE
    // Agrégation du nombre de patients par date
    const consultationsParDate = {};
    // Trier du plus ancien au plus récent pour le graphique
    const dataTrieeChronologique = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    dataTrieeChronologique.forEach(item => {
        consultationsParDate[item.date] = (consultationsParDate[item.date] || 0) + 1;
    });

    const datesLabels = Object.keys(consultationsParDate).map(d => {
        const [yyyy, mm, dd] = d.split('-');
        return `${dd}/${mm}`;
    });
    const valeursConsultations = Object.values(consultationsParDate);

    const ctxEvol = document.getElementById('chartEvolution').getContext('2d');
    chartEvolutionInstance = new Chart(ctxEvol, {
        type: 'line',
        data: {
            labels: datesLabels,
            datasets: [{
                label: 'Nombre de patients',
                data: valeursConsultations,
                borderColor: '#0284c7',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, ticks: { precision: 0 } }
            }
        }
    });

    // 2. REPARTITION DES ACTES
    const nbExtractions = data.filter(d => d.acte.includes('Extraction')).length;
    const nbSoins = data.filter(d => d.acte.includes('composite')).length;
    const nbDetartrage = data.filter(d => d.acte.includes('Détartrage')).length;
    const nbConsult = data.filter(d => d.acte.includes('Consultation')).length;

    const ctxActes = document.getElementById('chartActes').getContext('2d');
    chartActesInstance = new Chart(ctxActes, {
        type: 'bar',
        data: {
            labels: ['Extractions', 'Composites', 'Détartrages', 'Consultations'],
            datasets: [{
                data: [nbExtractions, nbSoins, nbDetartrage, nbConsult],
                backgroundColor: ['#ef4444', '#10b981', '#8b5cf6', '#3b82f6'],
                borderRadius: 6
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // 3. REPARTITION PAR SEXE
    const nbHommes = data.filter(d => d.sexe === 'M').length;
    const nbFemmes = data.filter(d => d.sexe === 'F').length;

    const ctxSexe = document.getElementById('chartSexe').getContext('2d');
    chartSexeInstance = new Chart(ctxSexe, {
        type: 'doughnut',
        data: {
            labels: ['Hommes (M)', 'Femmes (F)'],
            datasets: [{
                data: [nbHommes, nbFemmes],
                backgroundColor: ['#0284c7', '#ec4899']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}