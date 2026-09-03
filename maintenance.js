const listTechniciens = ['M. Sow (Biomédical)', 'M. Diop (Électricien/Plombier)', 'M. Faye (Froid/Climatisation)'];

document.addEventListener('DOMContentLoaded', () => {
    actualiserWorkflow();
    window.addEventListener('storage', (e) => {
        if (e.key === 'chan_tickets') actualiserWorkflow();
    });
});

function actualiserWorkflow() {
    const tickets = JSON.parse(localStorage.getItem('chan_tickets')) || [];
    const tbody = document.getElementById('table-maint-workflow');
    tbody.innerHTML = '';

    if (tickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">Aucun ticket à traiter.</td></tr>';
        return;
    }

    tickets.forEach((t, idx) => {
        let urgClass = 'urg-faible';
        if (t.urgence === 'Moyen') urgClass = 'urg-moyen';
        if (t.urgence === 'Critique') urgClass = 'urg-critique';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge ${urgClass}">${t.urgence || 'Moyen'}</span></td>
            <td><strong>${t.id}</strong></td>
            <td>${t.date}</td>
            <td><strong>${t.service}</strong></td>
            <td>${t.equipement}</td>
            <td>
                <select class="select-sm" onchange="affecterTech(${idx}, this.value)">
                    <option value="Non Attribué">-- Choisir --</option>
                    ${listTechniciens.map(tech => `<option value="${tech}" ${t.technicien === tech ? 'selected' : ''}>${tech}</option>`).join('')}
                </select>
            </td>
            <td>
                <select class="select-sm" onchange="changerStatut(${idx}, this.value)">
                    <option value="En Attente" ${t.statut === 'En Attente' ? 'selected' : ''}>En Attente</option>
                    <option value="En Cours" ${t.statut === 'En Cours' ? 'selected' : ''}>En Cours</option>
                    <option value="Résolu" ${t.statut === 'Résolu' ? 'selected' : ''}>Résolu</option>
                </select>
            </td>
            <td>${t.statut === 'Résolu' ? '✅ Traité' : '⏳ En attente'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function affecterTech(index, tech) {
    const tickets = JSON.parse(localStorage.getItem('chan_tickets')) || [];
    tickets[index].technicien = tech;
    if (tickets[index].statut === 'En Attente') tickets[index].statut = 'En Cours';
    localStorage.setItem('chan_tickets', JSON.stringify(tickets));
    actualiserWorkflow();
}

function changerStatut(index, statut) {
    const tickets = JSON.parse(localStorage.getItem('chan_tickets')) || [];
    tickets[index].statut = statut;
    localStorage.setItem('chan_tickets', JSON.stringify(tickets));
    actualiserWorkflow();
}