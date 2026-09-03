/*
// Base de données simulée des Équipements de l'Odontologie
const inventaireEquipements = [
    { id: 'EQ-01', nom: 'Fauteuil Dentaire principal', modele: 'Sirona C4+', service: 'Odontologie', etat: 'Bonne santé', marque: 'Dentsply Sirona', sn: 'SN-99823', dateInst: '2022-03-15' },
    { id: 'EQ-02', nom: 'Compresseur Médical', modele: 'AirTechnics 50L', service: 'Odontologie', etat: 'Bonne santé', marque: 'Durr Dental', sn: 'SN-44102', dateInst: '2021-11-10' },
    { id: 'EQ-03', nom: 'Scialytique Dentaire', modele: 'LED Optima', service: 'Odontologie', etat: 'Bonne santé', marque: 'KaVo', sn: 'SN-11029', dateInst: '2023-01-20' },
    { id: 'EQ-04', nom: 'Autoclave Stérilisation', modele: 'Vacuklav 40B', service: 'Odontologie', etat: 'Risque', marque: 'Melag', sn: 'SN-77301', dateInst: '2020-06-05' }
];

let chartDashCliniqueInst = null;
let chartDashEquipementInst = null;
let chartMaintAppareilsInst = null;

document.addEventListener('DOMContentLoaded', () => {
    initSPA();
    initModals();
    remplirSelectAppareils();
    actualiserTout();

    window.addEventListener('storage', (e) => {
        if (e.key === 'chan_tickets') actualiserTout();
    });
});

// Navigation Onglets SPA
function initSPA() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.page-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            navBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
}

// Inscrire les équipements dans le formulaire
function remplirSelectAppareils() {
    const sel = document.getElementById('ticket-appareil');
    sel.innerHTML = '';
    inventaireEquipements.forEach(eq => {
        const opt = document.createElement('option');
        opt.value = eq.nom;
        opt.textContent = `${eq.nom} (${eq.modele})`;
        sel.appendChild(opt);
    });
}

function initModals() {
    const modalTicket = document.getElementById('modal-ticket');
    const btnOpenTicket = document.getElementById('btn-open-ticket-modal');
    const btnCloseTicket = document.getElementById('close-modal-ticket');

    btnOpenTicket.onclick = () => modalTicket.style.display = 'flex';
    btnCloseTicket.onclick = () => modalTicket.style.display = 'none';

    const modalEq = document.getElementById('modal-equipement');
    const btnCloseEq = document.getElementById('close-modal-equipement');
    btnCloseEq.onclick = () => modalEq.style.display = 'none';

    // Formulaire de ticket
    document.getElementById('form-ticket').addEventListener('submit', (e) => {
        e.preventDefault();
        const cat = document.getElementById('ticket-categorie').value;
        const app = cat === 'Biomédical' ? document.getElementById('ticket-appareil').value : 'Infrastructure';
        const urgence = document.getElementById('ticket-urgence').value;
        const desc = document.getElementById('ticket-desc').value;
        const dateNow = new Date().toISOString().replace('T', ' ').substring(0, 16);

        const nouveauTicket = {
            id: `INT-${Math.floor(1000 + Math.random() * 9000)}`,
            date: dateNow,
            service: 'Odontologie',
            categorie: cat,
            equipement: app,
            typePanne: app,
            urgence: urgence,
            description: desc,
            technicien: 'Non Attribué',
            statut: 'En Attente'
        };

        const tickets = JSON.parse(localStorage.getItem('chan_tickets')) || [];
        tickets.unshift(nouveauTicket);
        localStorage.setItem('chan_tickets', JSON.stringify(tickets));

        document.getElementById('form-ticket').reset();
        modalTicket.style.display = 'none';
        actualiserTout();
    });
}

function actualiserTout() {
    const tickets = JSON.parse(localStorage.getItem('chan_tickets')) || [];
    const ticketsOdonto = tickets.filter(t => t.service === 'Odontologie');

    // Mettre à jour automatiquement l'état des appareils si panne active
    inventaireEquipements.forEach(eq => {
        const panneActive = ticketsOdonto.some(t => t.equipement === eq.nom && t.statut !== 'Résolu');
        if (panneActive) eq.etat = 'En panne';
        else if (eq.etat === 'En panne') eq.etat = 'Bonne santé';
    });

    actualiserBanniere(ticketsOdonto);
    actualiserKPIs(ticketsOdonto);
    rendreInventaireTable();
    rendreGraphiques(ticketsOdonto);
    rendreRegistreClinique();
}

function actualiserBanniere(tickets) {
    const bannerText = document.getElementById('banner-text');
    if (tickets.length > 0) {
        const t = tickets[0];
        bannerText.textContent = `${t.equipement} — Urgence : ${t.urgence} — Statut : ${t.statut}`;
    } else {
        bannerText.textContent = "Aucune demande récente";
    }
}

function actualiserKPIs(tickets) {
    const encours = tickets.filter(t => t.statut === 'En Cours' || t.statut === 'En Attente').length;
    const resolus = tickets.filter(t => t.statut === 'Résolu').length;
    const pannes = inventaireEquipements.filter(e => e.etat === 'En panne').length;

    document.getElementById('kpi-dash-pannes').textContent = pannes;
    document.getElementById('kpi-dash-encours').textContent = encours;

    document.getElementById('kpi-maint-total').textContent = tickets.length;
    document.getElementById('kpi-maint-encours').textContent = encours;
    document.getElementById('kpi-maint-resolus').textContent = resolus;
}

function rendreInventaireTable() {
    const tbody = document.getElementById('table-inventaire');
    tbody.innerHTML = '';

    inventaireEquipements.forEach(eq => {
        let badgeClass = 'badge-sante';
        if (eq.etat === 'Risque') badgeClass = 'badge-risque';
        if (eq.etat === 'En panne') badgeClass = 'badge-panne';

        const tr = document.createElement('tr');
        tr.className = 'clickable-row';
        tr.innerHTML = `
            <td><strong>${eq.nom}</strong></td>
            <td>${eq.modele}</td>
            <td>${eq.service}</td>
            <td><span class="badge ${badgeClass}">${eq.etat}</span></td>
            <td><button class="btn-primary" style="padding:4px 8px; font-size:11px;">Détails</button></td>
        `;
        tr.onclick = () => ouvrirModalEquipement(eq);
        tbody.appendChild(tr);
    });
}

function ouvrirModalEquipement(eq) {
    document.getElementById('eq-title').textContent = `${eq.nom} (${eq.modele})`;
    document.getElementById('eq-marque').textContent = eq.marque;
    document.getElementById('eq-sn').textContent = eq.sn;
    document.getElementById('eq-date').textContent = eq.dateInst;
    document.getElementById('eq-etat').textContent = eq.etat;

    const tickets = JSON.parse(localStorage.getItem('chan_tickets')) || [];
    const histoList = document.getElementById('eq-historique-list');
    histoList.innerHTML = '';

    const pannesPassees = tickets.filter(t => t.equipement === eq.nom);
    if (pannesPassees.length === 0) {
        histoList.innerHTML = '<li>Aucun historique de panne pour cet appareil.</li>';
    } else {
        pannesPassees.forEach(p => {
            const li = document.createElement('li');
            li.textContent = `[${p.date}] ${p.description} — Statut: ${p.statut} (${p.technicien})`;
            histoList.appendChild(li);
        });
    }

    document.getElementById('modal-equipement').style.display = 'flex';
}

function rendreRegistreClinique() {
    const tbody = document.getElementById('table-clinique');
    if (!tbody || tbody.children.length > 0) return;

    const actes = ['Extraction Dentaire', 'Détartrage', 'Soin de Carie', 'Prothèse', 'Consultation'];
    for(let i = 1; i <= 15; i++) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>PAT-2026-${1000 + i}</td>
            <td>2026-08-${10 + (i % 15)}</td>
            <td>${actes[i % actes.length]}</td>
            <td>Dr. Ndiaye</td>
            <td>Acte réalisé avec succès</td>
        `;
        tbody.appendChild(tr);
    }
}

function rendreGraphiques(tickets) {
    // Chart 1: Clinique
    const ctxC = document.getElementById('chartDashClinique').getContext('2d');
    if (chartDashCliniqueInst) chartDashCliniqueInst.destroy();
    chartDashCliniqueInst = new Chart(ctxC, {
        type: 'doughnut',
        data: { labels: ['Extractions', 'Soins', 'Prothèses'], datasets: [{ data: [60, 30, 10], backgroundColor: ['#0f766e', '#0284c7', '#f59e0b'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Chart 2: Santé
    const ctxE = document.getElementById('chartDashEquipement').getContext('2d');
    if (chartDashEquipementInst) chartDashEquipementInst.destroy();
    chartDashEquipementInst = new Chart(ctxE, {
        type: 'pie',
        data: { labels: ['Bonne Santé', 'En Panne'], datasets: [{ data: [inventaireEquipements.filter(e=>e.etat!='En panne').length, inventaireEquipements.filter(e=>e.etat=='En panne').length], backgroundColor: ['#10b981', '#ef4444'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Chart 3: Maintenances par appareil
    const pannesCount = {};
    tickets.forEach(t => { pannesCount[t.equipement] = (pannesCount[t.equipement] || 0) + 1; });
    const ctxM = document.getElementById('chartMaintAppareils').getContext('2d');
    if (chartMaintAppareilsInst) chartMaintAppareilsInst.destroy();
    chartMaintAppareilsInst = new Chart(ctxM, {
        type: 'bar',
        data: { labels: Object.keys(pannesCount), datasets: [{ label: 'Pannes', data: Object.values(pannesCount), backgroundColor: '#0f766e' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}
    */

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