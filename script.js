/*
// =============================================================
// VÉRIFICATION DE LA SESSION ET SÉCURITÉ ACCÈS (index.html)
// =============================================================
const sessionData = JSON.parse(localStorage.getItem('chan_session'));

// Table de correspondance des pages
const pagesParService = {
    'TOUS': 'index.html',
    'SUPERIEUR': 'superieur.html',
    'Odontologie': 'odonto.html',
    'Urgences': 'urgences.html',
    'Maternité': 'maternite.html',
    'Pédiatrie': 'pediatrie.html',
    'Bloc Opératoire': 'bloc.html'
};

// 1. Si pas de session -> retour au login
if (!sessionData) {
    window.location.href = 'login.html';
} 
// 2. Si c'est un Major de service (ex: Odontologie) qui essaie de taper l'URL index.html direct -> redirection
// NB: On laisse passer 'TOUS' (Maintenance) ET 'SUPERIEUR' (Direction Supérieure)
else if (sessionData.service !== 'TOUS' && sessionData.service !== 'SUPERIEUR') {
    const pageMajor = pagesParService[sessionData.service];
    if (pageMajor) {
        window.location.href = pageMajor;
    }
}

// =============================================================
// BASE DE DONNÉES SIMULÉE (145 LOGS)
// =============================================================
const servicesList = ['Maternité', 'Odontologie', 'Pédiatrie', 'Urgences', 'Bloc Opératoire'];
const pannesParService = {
    'Maternité': ['Climatisation', 'Électrique', 'Plomberie', 'Médical/Biomed'],
    'Odontologie': ['Fauteuil Dentaire', 'Électrique', 'Compressur', 'Plomberie'],
    'Pédiatrie': ['Couveuse', 'Électrique', 'Climatisation', 'Plomberie'],
    'Urgences': ['Moniteur ECG', 'Électrique', 'Fluides Médicaux', 'Plomberie'],
    'Bloc Opératoire': ['Scialytique', 'Table d\'Opération', 'Respirateur', 'Électrique']
};
const techniciens = ['P1', 'P2', 'P3', 'P4', 'P5'];

const couleuresPannes = {
    'Électrique': '#0284c7', 'Plomberie': '#06b6d4', 'Climatisation': '#10b981',
    'Médical/Biomed': '#ef4444', 'Fauteuil Dentaire': '#f59e0b', 'Compressur': '#8b5cf6',
    'Couveuse': '#ec4899', 'Moniteur ECG': '#6366f1', 'Fluides Médicaux': '#14b8a6',
    'Scialytique': '#84cc16', 'Table d\'Opération': '#d97706', 'Respirateur': '#dc2626'
};

const couleuresStatuts = {
    'Résolu': '#22c55e', 'En Cours': '#f97316', 'En Attente': '#2563eb', 'Pas Résolu': '#ef4444'
};

const dataset = [];
let seed = 1001;

for (let i = 1; i <= 374; i++) {
    const service = servicesList[i % servicesList.length];
    const pannesPossibles = pannesParService[service];
    const typePanne = pannesPossibles[i % pannesPossibles.length];
    const technicien = techniciens[i % techniciens.length];
    
    let statut = 'Résolu';
    if (i % 7 === 0) statut = 'En Cours';
    else if (i % 11 === 0) statut = 'En Attente';
    else if (i % 19 === 0) statut = 'Pas Résolu';

    const moisInt = (i % 6) + 1;
    const jourInt = ((i * 3) % 28) + 1;
    const dateSignalement = `2026-${String(moisInt).padStart(2, '0')}-${String(jourInt).padStart(2, '0')}`;
    const cout = (Math.floor((i * 37) % 85) + 15) * 1000;

    dataset.push({
        id: `INT-${seed++}`,
        date: dateSignalement,
        service: service,
        typePanne: typePanne,
        technicien: technicien,
        statut: statut,
        cout: cout
    });
}

// Instances Chart.js
let chartGlobalInstance = null;
let chartDetailBarInstance = null;
let chartDetailPieInstance = null;
let chartEvolutionInstance = null;
let chartCoutTechnicienInstance = null;

// Éléments DOM
let inputDateDebut, inputDateFin, selectService, selectStatut, selectPanne, btnReset, btnExport;

const optionsAxesNets = {
    ticks: {
        color: '#1e293b',
        font: { size: 11, weight: '600', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto' },
        maxRotation: 45, minRotation: 0
    },
    grid: { color: '#e2e8f0', lineWidth: 1 }
};

// INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    // Affichage des infos du cadre connecté
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

    inputDateDebut = document.getElementById('date-debut');
    inputDateFin = document.getElementById('date-fin');
    selectService = document.getElementById('select-service');
    selectStatut = document.getElementById('select-statut');
    selectPanne = document.getElementById('select-panne');
    btnReset = document.getElementById('btn-reset');
    btnExport = document.getElementById('btn-export');

    // VERROUILLAGE ET FILTRAGE PAR SERVICE
    // Seuls les Majors ont leur menu verrouillé. TOUS et SUPERIEUR ont accès à tout !
    if (sessionData && sessionData.service !== 'TOUS' && sessionData.service !== 'SUPERIEUR') {
        if (selectService) {
            selectService.value = sessionData.service;
            selectService.disabled = true; // Bloque le filtre pour le Major du service
        }
    }

    remplirOptionsPannes();
    initialiserChartGlobal();
    actualiserAfficheComplet();

    // Event Listeners
    inputDateDebut.addEventListener('change', actualiserAfficheComplet);
    inputDateFin.addEventListener('change', actualiserAfficheComplet);
    selectService.addEventListener('change', () => {
        remplirOptionsPannes();
        actualiserAfficheComplet();
    });
    selectStatut.addEventListener('change', actualiserAfficheComplet);
    selectPanne.addEventListener('change', actualiserAfficheComplet);

    btnReset.addEventListener('click', () => {
        inputDateDebut.value = '';
        inputDateFin.value = '';
        if (sessionData.service === 'TOUS' || sessionData.service === 'SUPERIEUR') {
            selectService.value = 'TOUS';
        }
        selectStatut.value = 'TOUS';
        remplirOptionsPannes();
        actualiserAfficheComplet();
    });

    btnExport.addEventListener('click', exporterCSV);
});

function remplirOptionsPannes() {
    const serviceSelectionne = selectService.value;
    const panneCourante = selectPanne.value;
    let pannesDispo = new Set();

    dataset.forEach(item => {
        if (serviceSelectionne === 'TOUS' || serviceSelectionne === 'SUPERIEUR' || item.service === serviceSelectionne) {
            pannesDispo.add(item.typePanne);
        }
    });

    selectPanne.innerHTML = '<option value="TOUS">Tous les types</option>';
    pannesDispo.forEach(panne => {
        const opt = document.createElement('option');
        opt.value = panne;
        opt.textContent = panne;
        selectPanne.appendChild(opt);
    });

    selectPanne.value = pannesDispo.has(panneCourante) ? panneCourante : 'TOUS';
}

function obtenirDonneesFiltrees() {
    const dDebut = inputDateDebut.value;
    const dFin = inputDateFin.value;
    const sService = selectService.value;
    const sStatut = selectStatut.value;
    const sPanne = selectPanne.value;

    return dataset.filter(item => {
        const mDateDebut = !dDebut || item.date >= dDebut;
        const mDateFin = !dFin || item.date <= dFin;
        // Permet de charger toutes les données quand 'TOUS' ou 'SUPERIEUR' est sélectionné
        const mService = (sService === 'TOUS' || sService === 'SUPERIEUR' || item.service === sService);
        const mStatut = (sStatut === 'TOUS' || item.statut === sStatut);
        const mPanne = (sPanne === 'TOUS' || item.typePanne === sPanne);
        return mDateDebut && mDateFin && mService && mStatut && mPanne;
    });
}

function actualiserAfficheComplet() {
    const donneesFiltrees = obtenirDonneesFiltrees();
    
    mettreAJourKPIs(donneesFiltrees);
    mettreAJourChartDetailBar(donneesFiltrees);
    mettreAJourChartDetailPie(donneesFiltrees);
    mettreAJourChartEvolutionEtPrediction(donneesFiltrees);
    mettreAJourChartCoutTechnicien(donneesFiltrees);
    mettreAJourTableau(donneesFiltrees);
}

function mettreAJourKPIs(data) {
    const total = data.length;
    const resolus = data.filter(d => d.statut === 'Résolu').length;
    const taux = total > 0 ? ((resolus / total) * 100).toFixed(1) : 0;
    const depensesTotales = data.reduce((acc, curr) => acc + curr.cout, 0);

    document.getElementById('kpi-total').textContent = total;
    document.getElementById('kpi-taux').textContent = `${taux}%`;
    document.getElementById('kpi-depenses').textContent = `${depensesTotales.toLocaleString('fr-FR')} FCFA`;
}

// 1. Vue Globale
function initialiserChartGlobal() {
    const compteursParService = {};
    servicesList.forEach(s => compteursParService[s] = 0);
    dataset.forEach(item => {
        compteursParService[item.service] = (compteursParService[item.service] || 0) + 1;
    });

    const ctx = document.getElementById('chartGlobal').getContext('2d');
    chartGlobalInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(compteursParService),
            datasets: [{
                label: 'Nombre d\'interventions',
                data: Object.values(compteursParService),
                backgroundColor: '#004b8d',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2,
            plugins: { legend: { display: false } },
            scales: { x: optionsAxesNets, y: { ...optionsAxesNets, beginAtZero: true } }
        }
    });
}

// 2. Types de pannes
function mettreAJourChartDetailBar(data) {
    const pannesCompte = {};
    data.forEach(item => { pannesCompte[item.typePanne] = (pannesCompte[item.typePanne] || 0) + 1; });

    const labels = Object.keys(pannesCompte);
    const values = Object.values(pannesCompte);
    const colors = labels.map(l => couleuresPannes[l] || '#0284c7');

    const ctx = document.getElementById('chartDetailBar').getContext('2d');
    if (chartDetailBarInstance) chartDetailBarInstance.destroy();

    chartDetailBarInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: 'Nombre de pannes', data: values, backgroundColor: colors, borderRadius: 4 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2,
            plugins: { legend: { display: false } },
            scales: { x: optionsAxesNets, y: { ...optionsAxesNets, beginAtZero: true, ticks: { ...optionsAxesNets.ticks, stepSize: 1 } } }
        }
    });
}

// 3. ÉVOLUTION TEMPORELLE + PROJECTION À 30 JOURS (Régression Linéaire)
function mettreAJourChartEvolutionEtPrediction(data) {
    const occurencesParDate = {};
    data.forEach(item => {
        occurencesParDate[item.date] = (occurencesParDate[item.date] || 0) + 1;
    });

    const datesTriees = Object.keys(occurencesParDate).sort();
    const valeursReelles = datesTriees.map(d => occurencesParDate[d]);
    const n = datesTriees.length;

    let labelsComplets = [...datesTriees];
    let reellesData = [...valeursReelles];
    let tendanceData = [];
    let predictionVal30j = "--";

    if (n > 1) {
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += valeursReelles[i];
            sumXY += i * valeursReelles[i];
            sumXX += i * i;
        }

        const pente_a = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const ordonnee_b = (sumY - pente_a * sumX) / n;

        // Calcul tendance historique
        tendanceData = datesTriees.map((_, i) => parseFloat((pente_a * i + ordonnee_b).toFixed(2)));

        // Génération de la projection à +30 jours
        const derniereDateStr = datesTriees[datesTriees.length - 1];
        const derniereDate = new Date(derniereDateStr);

        for (let step = 1; step <= 30; step++) {
            const dateProjetee = new Date(derniereDate);
            dateProjetee.setDate(derniereDate.getDate() + step);
            const dateIso = dateProjetee.toISOString().split('T')[0];

            labelsComplets.push(dateIso);
            reellesData.push(null); // Pas de données réelles pour le futur
            
            const valPred = Math.max(0, pente_a * (n - 1 + step) + ordonnee_b);
            tendanceData.push(parseFloat(valPred.toFixed(2)));
        }

        // Estimation cumulée sur les 30 prochains jours
        const total30jProjetes = tendanceData.slice(n).reduce((acc, curr) => acc + curr, 0);
        predictionVal30j = `~${Math.round(total30jProjetes)} pannes`;
    } else {
        tendanceData = valeursReelles;
    }

    document.getElementById('kpi-projection').textContent = predictionVal30j;

    const ctx = document.getElementById('chartEvolution').getContext('2d');
    if (chartEvolutionInstance) chartEvolutionInstance.destroy();

    chartEvolutionInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelsComplets,
            datasets: [
                {
                    label: 'Interventions Réelles',
                    data: reellesData,
                    borderColor: '#0284c7',
                    backgroundColor: 'rgba(2, 132, 199, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3
                },
                {
                    label: 'Courbe de Tendance & Projection (+30j)',
                    data: tendanceData,
                    borderColor: '#8b5cf6',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2,
            plugins: {
                legend: { display: true, position: 'top', labels: { color: '#1e293b', font: { weight: '600' } } }
            },
            scales: {
                x: { ...optionsAxesNets, ticks: { ...optionsAxesNets.ticks, maxRotation: 45 } },
                y: { ...optionsAxesNets, beginAtZero: true }
            }
        }
    });
}

// 4. ANALYSE DES COÛTS PAR TECHNICIEN
function mettreAJourChartCoutTechnicien(data) {
    const coutsParTech = {};
    techniciens.forEach(t => coutsParTech[t] = 0);

    data.forEach(item => {
        coutsParTech[item.technicien] = (coutsParTech[item.technicien] || 0) + item.cout;
    });

    const ctx = document.getElementById('chartCoutTechnicien').getContext('2d');
    if (chartCoutTechnicienInstance) chartCoutTechnicienInstance.destroy();

    chartCoutTechnicienInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(coutsParTech),
            datasets: [{
                label: 'Coût total (FCFA)',
                data: Object.values(coutsParTech),
                backgroundColor: '#f59e0b',
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y', // Histogramme horizontal
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2,
            plugins: { legend: { display: false } },
            scales: {
                x: { ...optionsAxesNets, beginAtZero: true },
                y: optionsAxesNets
            }
        }
    });
}

// 5. Statuts (Doughnut)
function mettreAJourChartDetailPie(data) {
    const statutsCompte = {};
    data.forEach(item => { statutsCompte[item.statut] = (statutsCompte[item.statut] || 0) + 1; });

    const labels = Object.keys(statutsCompte);
    const values = Object.values(statutsCompte);
    const colors = labels.map(l => couleuresStatuts[l] || '#94a3b8');

    const ctx = document.getElementById('chartDetailPie').getContext('2d');
    if (chartDetailPieInstance) chartDetailPieInstance.destroy();

    chartDetailPieInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#ffffff' }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2,
            plugins: { legend: { position: 'bottom', labels: { color: '#1e293b', font: { size: 12, weight: '600' } } } }
        }
    });
}

// Tableau
function mettreAJourTableau(data) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: #94a3b8;">Aucune intervention enregistrée pour cette plage.</td></tr>`;
        return;
    }

    data.slice(0, 15).forEach(item => {
        const tr = document.createElement('tr');
        let badgeClass = 'badge-resolu';
        if (item.statut === 'En Cours') badgeClass = 'badge-encours';
        if (item.statut === 'En Attente') badgeClass = 'badge-attente';
        if (item.statut === 'Pas Résolu') badgeClass = 'badge-pasresolu';

        tr.innerHTML = `
            <td><strong>${item.id}</strong></td>
            <td>${item.date}</td>
            <td>${item.service}</td>
            <td>${item.typePanne}</td>
            <td>${item.technicien}</td>
            <td><span class="badge ${badgeClass}">${item.statut}</span></td>
            <td>${item.cout.toLocaleString('fr-FR')} FCFA</td>
        `;
        tbody.appendChild(tr);
    });
}

// Export CSV
function exporterCSV() {
    const data = obtenirDonneesFiltrees();
    let csv = 'ID;Date Signalement;Service;Type Panne;Technicien;Statut;Cout (FCFA)\n';

    data.forEach(row => {
        csv += `${row.id};${row.date};${row.service};${row.typePanne};${row.technicien};${row.statut};${row.cout}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'interventions_CH_Abass_Ndao.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

*/

// =============================================================
// VÉRIFICATION DE LA SESSION ET SÉCURITÉ ACCÈS (index.html)
// =============================================================
const sessionData = JSON.parse(localStorage.getItem('chan_session'));

// Table de correspondance des pages
const pagesParService = {
    'TOUS': 'index.html',
    'SUPERIEUR': 'superieur.html',
    'Odontologie': 'odonto.html',
    'Urgences': 'urgences.html',
    'Maternité': 'maternite.html',
    'Pédiatrie': 'pediatrie.html',
    'Bloc Opératoire': 'bloc.html'
};

// 1. Si pas de session -> retour au login
if (!sessionData) {
    window.location.href = 'login.html';
} 
// 2. Redirection des utilisateurs restreints (Majors)
else if (sessionData.service !== 'TOUS' && sessionData.service !== 'SUPERIEUR') {
    const pageMajor = pagesParService[sessionData.service];
    if (pageMajor) {
        window.location.href = pageMajor;
    }
}

// =============================================================
// BASE DE DONNÉES ET CHARGEMENT DYNAMIQUE (LOCALSTORAGE + SIMULATION)
// =============================================================
const servicesList = ['Maternité', 'Odontologie', 'Pédiatrie', 'Urgences', 'Bloc Opératoire'];
const pannesParService = {
    'Maternité': ['Climatisation', 'Électrique', 'Plomberie', 'Médical/Biomed'],
    'Odontologie': ['Fauteuil Dentaire', 'Électrique', 'Compressur', 'Plomberie'],
    'Pédiatrie': ['Couveuse', 'Électrique', 'Climatisation', 'Plomberie'],
    'Urgences': ['Moniteur ECG', 'Électrique', 'Fluides Médicaux', 'Plomberie'],
    'Bloc Opératoire': ['Scialytique', 'Table d\'Opération', 'Respirateur', 'Électrique']
};
const techniciens = ['P1', 'P2', 'P3', 'P4', 'P5'];

const couleuresPannes = {
    'Électrique': '#0284c7', 'Plomberie': '#06b6d4', 'Climatisation': '#10b981',
    'Médical/Biomed': '#ef4444', 'Fauteuil Dentaire': '#f59e0b', 'Compressur': '#8b5cf6',
    'Couveuse': '#ec4899', 'Moniteur ECG': '#6366f1', 'Fluides Médicaux': '#14b8a6',
    'Scialytique': '#84cc16', 'Table d\'Opération': '#d97706', 'Respirateur': '#dc2626'
};

const couleuresStatuts = {
    'Résolu': '#22c55e', 'En Cours': '#f97316', 'En Attente': '#2563eb', 'Pas Résolu': '#ef4444'
};

// Generation des donnees simulees historiques
const dataset = [];
let seed = 1001;

for (let i = 1; i <= 374; i++) {
    const service = servicesList[i % servicesList.length];
    const pannesPossibles = pannesParService[service];
    const typePanne = pannesPossibles[i % pannesPossibles.length];
    const technicien = techniciens[i % techniciens.length];
    
    let statut = 'Résolu';
    if (i % 7 === 0) statut = 'En Cours';
    else if (i % 11 === 0) statut = 'En Attente';
    else if (i % 19 === 0) statut = 'Pas Résolu';

    const moisInt = (i % 6) + 1;
    const jourInt = ((i * 3) % 28) + 1;
    const dateSignalement = `2026-${String(moisInt).padStart(2, '0')}-${String(jourInt).padStart(2, '0')}`;
    const cout = (Math.floor((i * 37) % 85) + 15) * 1000;

    dataset.push({
        id: `INT-${seed++}`,
        date: dateSignalement,
        service: service,
        typePanne: typePanne,
        technicien: technicien,
        statut: statut,
        cout: cout
    });
}

// Fusion des demandes soumises depuis le formulaire utilisateur (localStorage)
function chargerDatasetComplet() {
    const demandesSaisies = JSON.parse(localStorage.getItem('demandes_odonto')) || [];
    
    const demandesFormatees = demandesSaisies.map(d => ({
        id: d.id || `DEM-${Math.floor(1000 + Math.random() * 9000)}`,
        date: d.date || new Date().toISOString().split('T')[0],
        service: d.service || 'Odontologie',
        typePanne: d.type || d.equipement || 'Électrique',
        technicien: d.technicien || 'En attente',
        statut: d.statut || 'En Attente',
        cout: d.cout || 0
    }));

    return [...demandesFormatees, ...dataset];
}

const datasetGlobal = chargerDatasetComplet();

// Instances Chart.js
let chartGlobalInstance = null;
let chartDetailBarInstance = null;
let chartDetailPieInstance = null;
let chartEvolutionInstance = null;
let chartCoutTechnicienInstance = null;

// Éléments DOM
let inputDateDebut, inputDateFin, selectService, selectStatut, selectPanne, btnReset, btnExport;

const optionsAxesNets = {
    ticks: {
        color: '#1e293b',
        font: { size: 11, weight: '600', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto' },
        maxRotation: 45, minRotation: 0
    },
    grid: { color: '#e2e8f0', lineWidth: 1 }
};

// INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    // Affichage des infos de la session
    const userDisplay = document.getElementById('user-display');
    if (userDisplay && sessionData) {
        userDisplay.textContent = `${sessionData.nom || 'Utilisateur'} (${sessionData.service})`;
    }

    // Gestion de la Déconnexion
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('chan_session');
            window.location.href = 'login.html';
        });
    }

    inputDateDebut = document.getElementById('date-debut');
    inputDateFin = document.getElementById('date-fin');
    selectService = document.getElementById('select-service');
    selectStatut = document.getElementById('select-statut');
    selectPanne = document.getElementById('select-panne');
    btnReset = document.getElementById('btn-reset');
    btnExport = document.getElementById('btn-export');

    // Verrouillage du filtre selon le rôle
    if (sessionData && sessionData.service !== 'TOUS' && sessionData.service !== 'SUPERIEUR') {
        if (selectService) {
            selectService.value = sessionData.service;
            selectService.disabled = true;
        }
    }

    remplirOptionsPannes();
    initialiserChartGlobal();
    actualiserAfficheComplet();

    // Événements
    if (inputDateDebut) inputDateDebut.addEventListener('change', actualiserAfficheComplet);
    if (inputDateFin) inputDateFin.addEventListener('change', actualiserAfficheComplet);
    if (selectService) {
        selectService.addEventListener('change', () => {
            remplirOptionsPannes();
            actualiserAfficheComplet();
        });
    }
    if (selectStatut) selectStatut.addEventListener('change', actualiserAfficheComplet);
    if (selectPanne) selectPanne.addEventListener('change', actualiserAfficheComplet);

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (inputDateDebut) inputDateDebut.value = '';
            if (inputDateFin) inputDateFin.value = '';
            if (selectService && (sessionData.service === 'TOUS' || sessionData.service === 'SUPERIEUR')) {
                selectService.value = 'TOUS';
            }
            if (selectStatut) selectStatut.value = 'TOUS';
            remplirOptionsPannes();
            actualiserAfficheComplet();
        });
    }

    if (btnExport) btnExport.addEventListener('click', exporterCSV);
});

function remplirOptionsPannes() {
    if (!selectPanne) return;
    const serviceSelectionne = selectService ? selectService.value : 'TOUS';
    const panneCourante = selectPanne.value;
    let pannesDispo = new Set();

    datasetGlobal.forEach(item => {
        if (serviceSelectionne === 'TOUS' || serviceSelectionne === 'SUPERIEUR' || item.service === serviceSelectionne) {
            pannesDispo.add(item.typePanne);
        }
    });

    selectPanne.innerHTML = '<option value="TOUS">Tous les types</option>';
    pannesDispo.forEach(panne => {
        const opt = document.createElement('option');
        opt.value = panne;
        opt.textContent = panne;
        selectPanne.appendChild(opt);
    });

    selectPanne.value = pannesDispo.has(panneCourante) ? panneCourante : 'TOUS';
}

function obtenirDonneesFiltrees() {
    const dDebut = inputDateDebut ? inputDateDebut.value : '';
    const dFin = inputDateFin ? inputDateFin.value : '';
    const sService = selectService ? selectService.value : 'TOUS';
    const sStatut = selectStatut ? selectStatut.value : 'TOUS';
    const sPanne = selectPanne ? selectPanne.value : 'TOUS';

    return datasetGlobal.filter(item => {
        const mDateDebut = !dDebut || item.date >= dDebut;
        const mDateFin = !dFin || item.date <= dFin;
        const mService = (sService === 'TOUS' || sService === 'SUPERIEUR' || item.service === sService);
        const mStatut = (sStatut === 'TOUS' || item.statut === sStatut);
        const mPanne = (sPanne === 'TOUS' || item.typePanne === sPanne);
        return mDateDebut && mDateFin && mService && mStatut && mPanne;
    });
}

function actualiserAfficheComplet() {
    const donneesFiltrees = obtenirDonneesFiltrees();
    
    mettreAJourKPIs(donneesFiltrees);
    mettreAJourChartDetailBar(donneesFiltrees);
    mettreAJourChartDetailPie(donneesFiltrees);
    mettreAJourChartEvolutionEtPrediction(donneesFiltrees);
    mettreAJourChartCoutTechnicien(donneesFiltrees);
    mettreAJourTableau(donneesFiltrees);
}

function mettreAJourKPIs(data) {
    const total = data.length;
    const resolus = data.filter(d => d.statut === 'Résolu').length;
    const taux = total > 0 ? ((resolus / total) * 100).toFixed(1) : 0;
    const depensesTotales = data.reduce((acc, curr) => acc + curr.cout, 0);

    const elemTotal = document.getElementById('kpi-total');
    const elemTaux = document.getElementById('kpi-taux');
    const elemDepenses = document.getElementById('kpi-depenses');

    if (elemTotal) elemTotal.textContent = total;
    if (elemTaux) elemTaux.textContent = `${taux}%`;
    if (elemDepenses) elemDepenses.textContent = `${depensesTotales.toLocaleString('fr-FR')} FCFA`;
}

// 1. Vue Globale Par Service
function initialiserChartGlobal() {
    const canvas = document.getElementById('chartGlobal');
    if (!canvas) return;

    const compteursParService = {};
    servicesList.forEach(s => compteursParService[s] = 0);
    datasetGlobal.forEach(item => {
        compteursParService[item.service] = (compteursParService[item.service] || 0) + 1;
    });

    const ctx = canvas.getContext('2d');
    chartGlobalInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(compteursParService),
            datasets: [{
                label: 'Nombre d\'interventions',
                data: Object.values(compteursParService),
                backgroundColor: '#004b8d',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2,
            plugins: { legend: { display: false } },
            scales: { x: optionsAxesNets, y: { ...optionsAxesNets, beginAtZero: true } }
        }
    });
}

// 2. Histogramme des types de pannes
function mettreAJourChartDetailBar(data) {
    const canvas = document.getElementById('chartDetailBar');
    if (!canvas) return;

    const pannesCompte = {};
    data.forEach(item => { pannesCompte[item.typePanne] = (pannesCompte[item.typePanne] || 0) + 1; });

    const labels = Object.keys(pannesCompte);
    const values = Object.values(pannesCompte);
    const colors = labels.map(l => couleuresPannes[l] || '#0284c7');

    const ctx = canvas.getContext('2d');
    if (chartDetailBarInstance) chartDetailBarInstance.destroy();

    chartDetailBarInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: 'Nombre de pannes', data: values, backgroundColor: colors, borderRadius: 4 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2,
            plugins: { legend: { display: false } },
            scales: { x: optionsAxesNets, y: { ...optionsAxesNets, beginAtZero: true, ticks: { ...optionsAxesNets.ticks, stepSize: 1 } } }
        }
    });
}

// 3. Évolution Temporelle et Projection Linéaire à 30 jours
function mettreAJourChartEvolutionEtPrediction(data) {
    const canvas = document.getElementById('chartEvolution');
    if (!canvas) return;

    const occurencesParDate = {};
    data.forEach(item => {
        occurencesParDate[item.date] = (occurencesParDate[item.date] || 0) + 1;
    });

    const datesTriees = Object.keys(occurencesParDate).sort();
    const valeursReelles = datesTriees.map(d => occurencesParDate[d]);
    const n = datesTriees.length;

    let labelsComplets = [...datesTriees];
    let reellesData = [...valeursReelles];
    let tendanceData = [];
    let predictionVal30j = "--";

    if (n > 1) {
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += valeursReelles[i];
            sumXY += i * valeursReelles[i];
            sumXX += i * i;
        }

        const pente_a = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const ordonnee_b = (sumY - pente_a * sumX) / n;

        tendanceData = datesTriees.map((_, i) => parseFloat((pente_a * i + ordonnee_b).toFixed(2)));

        const derniereDateStr = datesTriees[datesTriees.length - 1];
        const derniereDate = new Date(derniereDateStr);

        for (let step = 1; step <= 30; step++) {
            const dateProjetee = new Date(derniereDate);
            dateProjetee.setDate(derniereDate.getDate() + step);
            const dateIso = dateProjetee.toISOString().split('T')[0];

            labelsComplets.push(dateIso);
            reellesData.push(null);
            
            const valPred = Math.max(0, pente_a * (n - 1 + step) + ordonnee_b);
            tendanceData.push(parseFloat(valPred.toFixed(2)));
        }

        const total30jProjetes = tendanceData.slice(n).reduce((acc, curr) => acc + curr, 0);
        predictionVal30j = `~${Math.round(total30jProjetes)} pannes`;
    } else {
        tendanceData = valeursReelles;
    }

    const elemProjection = document.getElementById('kpi-projection');
    if (elemProjection) elemProjection.textContent = predictionVal30j;

    const ctx = canvas.getContext('2d');
    if (chartEvolutionInstance) chartEvolutionInstance.destroy();

    chartEvolutionInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelsComplets,
            datasets: [
                {
                    label: 'Interventions Réelles',
                    data: reellesData,
                    borderColor: '#0284c7',
                    backgroundColor: 'rgba(2, 132, 199, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3
                },
                {
                    label: 'Courbe de Tendance & Projection (+30j)',
                    data: tendanceData,
                    borderColor: '#8b5cf6',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2,
            plugins: {
                legend: { display: true, position: 'top', labels: { color: '#1e293b', font: { weight: '600' } } }
            },
            scales: {
                x: { ...optionsAxesNets, ticks: { ...optionsAxesNets.ticks, maxRotation: 45 } },
                y: { ...optionsAxesNets, beginAtZero: true }
            }
        }
    });
}

// 4. Analyse des Coûts par Technicien
function mettreAJourChartCoutTechnicien(data) {
    const canvas = document.getElementById('chartCoutTechnicien');
    if (!canvas) return;

    const coutsParTech = {};
    techniciens.forEach(t => coutsParTech[t] = 0);

    data.forEach(item => {
        coutsParTech[item.technicien] = (coutsParTech[item.technicien] || 0) + item.cout;
    });

    const ctx = canvas.getContext('2d');
    if (chartCoutTechnicienInstance) chartCoutTechnicienInstance.destroy();

    chartCoutTechnicienInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(coutsParTech),
            datasets: [{
                label: 'Coût total (FCFA)',
                data: Object.values(coutsParTech),
                backgroundColor: '#f59e0b',
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2,
            plugins: { legend: { display: false } },
            scales: {
                x: { ...optionsAxesNets, beginAtZero: true },
                y: optionsAxesNets
            }
        }
    });
}

// 5. Statuts (Doughnut)
function mettreAJourChartDetailPie(data) {
    const canvas = document.getElementById('chartDetailPie');
    if (!canvas) return;

    const statutsCompte = {};
    data.forEach(item => { statutsCompte[item.statut] = (statutsCompte[item.statut] || 0) + 1; });

    const labels = Object.keys(statutsCompte);
    const values = Object.values(statutsCompte);
    const colors = labels.map(l => couleuresStatuts[l] || '#94a3b8');

    const ctx = canvas.getContext('2d');
    if (chartDetailPieInstance) chartDetailPieInstance.destroy();

    chartDetailPieInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#ffffff' }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 2,
            plugins: { legend: { position: 'bottom', labels: { color: '#1e293b', font: { size: 12, weight: '600' } } } }
        }
    });
}

// Remplissage du Tableau de bord
function mettreAJourTableau(data) {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: #94a3b8;">Aucune intervention enregistrée pour cette plage.</td></tr>`;
        return;
    }

    data.slice(0, 15).forEach(item => {
        const tr = document.createElement('tr');
        let badgeClass = 'badge-resolu';
        if (item.statut === 'En Cours') badgeClass = 'badge-encours';
        if (item.statut === 'En Attente') badgeClass = 'badge-attente';
        if (item.statut === 'Pas Résolu') badgeClass = 'badge-pasresolu';

        tr.innerHTML = `
            <td><strong>${item.id}</strong></td>
            <td>${item.date}</td>
            <td>${item.service}</td>
            <td>${item.typePanne}</td>
            <td>${item.technicien}</td>
            <td><span class="badge ${badgeClass}">${item.statut}</span></td>
            <td>${item.cout.toLocaleString('fr-FR')} FCFA</td>
        `;
        tbody.appendChild(tr);
    });
}

// Export au format CSV
function exporterCSV() {
    const data = obtenirDonneesFiltrees();
    let csv = 'ID;Date Signalement;Service;Type Panne;Technicien;Statut;Cout (FCFA)\n';

    data.forEach(row => {
        csv += `${row.id};${row.date};${row.service};${row.typePanne};${row.technicien};${row.statut};${row.cout}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'interventions_CH_Abass_Ndao.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}




//--------------------------

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-traitement');
  const formAssignation = document.getElementById('form-assignation');

  // 1. Initialisation avec une demande de test si le localStorage est vide
  function initialiserDonnees() {
    const demandesExiste = localStorage.getItem('chan_demandes');
    if (!demandesExiste) {
      const demandesExemple = [
        {
          id: 'DEM-2026-001',
          service: 'Odontologie',
          appareil: 'Fauteuil Dentaire Hydraulique',
          demandeur: 'Dr. Diop',
          date: '03/09/2026',
          urgence: 'Haute',
          description: 'Fuite d\'huile au niveau du vérin principal et blocage de la montée.',
          statut: 'En Attente',
          secteur: '',
          technicienNom: ''
        }
      ];
      localStorage.setItem('chan_demandes', JSON.stringify(demandesExemple));
    }
  }

  // 2. Rendu des cartes dans chaque section
  function rechargerPuzzles() {
    const demandes = JSON.parse(localStorage.getItem('chan_demandes') || '[]');

    const cAttente = document.getElementById('container-attente');
    const cEncours = document.getElementById('container-encours');
    const cTraitees = document.getElementById('container-traitees');

    cAttente.innerHTML = '';
    cEncours.innerHTML = '';
    cTraitees.innerHTML = '';

    demandes.forEach(d => {
      const div = document.createElement('div');

      if (d.statut === 'En Attente') {
        div.className = 'card-demande card-attente';
        div.innerHTML = `
          <div class="card-title">${d.id} - ${d.appareil}</div>
          <div class="card-info"><strong>Service:</strong> ${d.service} | <strong>Date:</strong> ${d.date}</div>
          <div class="card-info"><span class="badge badge-urgence">Urgence: ${d.urgence}</span></div>
        `;
        div.addEventListener('click', () => ouvrirModal(d));
        cAttente.appendChild(div);
      } 
      else if (d.statut === 'En Cours') {
        div.className = 'card-demande card-encours';
        div.innerHTML = `
          <div class="card-title">${d.id} - ${d.appareil}</div>
          <div class="card-info"><strong>Secteur:</strong> ${d.secteur}</div>
          <div class="card-info"><strong>Technicien:</strong> ${d.technicienNom}</div>
          <div class="card-actions">
            <button class="btn btn-secondary" style="font-size: 11px; padding: 6px;" onclick="changerStatut('${d.id}', 'En Attente')">↩ Attente</button>
            <button class="btn btn-success" style="font-size: 11px; padding: 6px;" onclick="changerStatut('${d.id}', 'Traité')">✅ Traité</button>
          </div>
        `;
        cEncours.appendChild(div);
      } 
      else if (d.statut === 'Traité') {
        div.className = 'card-demande card-traitee';
        div.innerHTML = `
          <div class="card-title">${d.id} - ${d.appareil}</div>
          <div class="card-info"><strong>Secteur:</strong> ${d.secteur}</div>
          <div class="card-info"><strong>Résolu par:</strong> ${d.technicienNom}</div>
          <div style="margin-top: 6px;"><span class="badge badge-resolu">Terminé</span></div>
        `;
        cTraitees.appendChild(div);
      }
    });
  }

  // 3. Gestion de la Modale d'assignation
  function ouvrirModal(d) {
    document.getElementById('modal-demande-id').value = d.id;
    document.getElementById('modal-id-title').textContent = `Traitement : ${d.id}`;
    document.getElementById('m-service').textContent = d.service;
    document.getElementById('m-appareil').textContent = d.appareil;
    document.getElementById('m-demandeur').textContent = d.demandeur;
    document.getElementById('m-date').textContent = d.date;
    document.getElementById('m-description').textContent = d.description;

    // Réinitialisation des champs du formulaire
    document.getElementById('secteur-charge').value = '';
    document.getElementById('personne-charge').value = '';

    modal.style.display = 'flex';
  }

  document.getElementById('btn-fermer-modal').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // 4. Validation du formulaire d'assignation
  formAssignation.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('modal-demande-id').value;
    const secteur = document.getElementById('secteur-charge').value;
    const tech = document.getElementById('personne-charge').value;

    let demandes = JSON.parse(localStorage.getItem('chan_demandes') || '[]');
    demandes = demandes.map(d => {
      if (d.id === id) {
        d.statut = 'En Cours';
        d.secteur = secteur;
        d.technicienNom = tech;
      }
      return d;
    });

    localStorage.setItem('chan_demandes', JSON.stringify(demandes));
    modal.style.display = 'none';
    rechargerPuzzles();
  });

  // 5. Modification dynamique du statut
  window.changerStatut = function(id, nouveauStatut) {
    let demandes = JSON.parse(localStorage.getItem('chan_demandes') || '[]');
    demandes = demandes.map(d => {
      if (d.id === id) {
        d.statut = nouveauStatut;
      }
      return d;
    });
    localStorage.setItem('chan_demandes', JSON.stringify(demandes));
    rechargerPuzzles();
  };

  // 6. Déconnexion
  document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('chan_session');
    window.location.href = 'login.html';
  });

  // Exécution au chargement
  initialiserDonnees();
  rechargerPuzzles();
});