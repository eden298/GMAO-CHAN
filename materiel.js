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
    if (!user) return;

    document.getElementById('user-name').textContent = user.nom;
    document.getElementById('user-role').textContent = user.service === 'SUPERIEUR' ? 'Accès Direction Supérieure' : 'Responsable Odontologie';

    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('chan_session');
        window.location.href = 'login.html';
    });
});
*

/MISE A JOUR MATERIEL
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
    if (!user) return;

    document.getElementById('user-name').textContent = user.nom || 'Utilisateur';
    document.getElementById('user-role').textContent = user.service === 'SUPERIEUR' ? 'Accès Direction Supérieure' : 'Responsable Odontologie';

    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('chan_session');
        window.location.href = 'login.html';
    });

    const tbody = document.getElementById('tbody-materiel');
    const btnToggleEdit = document.getElementById('btn-toggle-edit');
    const btnOpenModal = document.getElementById('btn-open-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const modalAjout = document.getElementById('modal-ajout');
    const formAjout = document.getElementById('form-ajout-materiel');

    let listeMateriel = [];
    let isEditMode = false;
    let editingRowId = null;

    // Charger les équipements depuis Supabase Cloud
    async function chargerMateriel() {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #64748b; padding: 20px;">Chargement des équipements...</td></tr>`;
        try {
            const { data, error } = await _supabase
                .from('materiels')
                .select('*')
                .order('code_appareil', { ascending: true });

            if (error) throw error;
            listeMateriel = data || [];
            afficherMateriel();
        } catch (err) {
            console.error('Erreur chargement Supabase :', err.message);
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #dc2626; padding: 20px;">Erreur de chargement de la base de données.</td></tr>`;
        }
    }

    // Affichage des données
    function afficherMateriel() {
        tbody.innerHTML = '';
        const colHeader = document.querySelector('.col-actions-header');
        colHeader.style.display = isEditMode ? 'table-cell' : 'none';

        if (listeMateriel.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${isEditMode ? 8 : 7}" style="text-align: center; color: #64748b; padding: 20px;">Aucun appareil enregistré.</td></tr>`;
            return;
        }

        listeMateriel.forEach((item) => {
            const tr = document.createElement('tr');
            const isEditing = (editingRowId === item.id);

            let classEtat = 'badge-other';
            const etat = item.etat_fonctionnel || 'Opérationnel';
            if (etat === 'En Panne') classEtat = 'badge-red';
            else if (etat === 'Opérationnel') classEtat = 'badge-green';
            else if (etat === 'Sous Maintenance') classEtat = 'badge-purple';

            if (isEditing) {
                tr.innerHTML = `
                    <td><input type="text" id="edit-code-${item.id}" value="${item.code_appareil || ''}" style="width: 100%;"></td>
                    <td><input type="text" id="edit-nom-${item.id}" value="${item.nom_equipement || ''}" style="width: 100%;"></td>
                    <td><input type="text" id="edit-marque-${item.id}" value="${item.marque || ''}" style="width: 100%;"></td>
                    <td><input type="text" id="edit-modele-${item.id}" value="${item.modele || ''}" style="width: 100%;"></td>
                    <td><input type="text" id="edit-loc-${item.id}" value="${item.localisation || ''}" style="width: 100%;"></td>
                    <td>
                        <select id="edit-etat-${item.id}" style="width: 100%;">
                            <option value="Opérationnel" ${etat === 'Opérationnel' ? 'selected' : ''}>Opérationnel</option>
                            <option value="En Panne" ${etat === 'En Panne' ? 'selected' : ''}>En Panne</option>
                            <option value="Sous Maintenance" ${etat === 'Sous Maintenance' ? 'selected' : ''}>Sous Maintenance</option>
                        </select>
                    </td>
                    <td><input type="text" id="edit-maint-${item.id}" value="${item.derniere_maintenance || ''}" style="width: 100%;"></td>
                    <td style="display: flex; gap: 4px;">
                        <button onclick="validerModification('${item.id}')" class="btn" style="background:#16a34a; color:white; padding:4px 8px; font-size:11px;">✔️ Valider</button>
                        <button onclick="annulerEdition()" class="btn btn-secondary" style="padding:4px 8px; font-size:11px;">❌ Annuler</button>
                    </td>
                `;
            } else {
                let actionTd = isEditMode ? `
                    <td>
                        <button onclick="activerEditionLigne('${item.id}')" class="btn btn-primary" style="padding:4px 8px; font-size:11px;">✏️ Modifier</button>
                        <button onclick="supprimerAppareil('${item.id}')" class="btn" style="background:#dc2626; color:white; padding:4px 8px; font-size:11px; margin-left:2px;">🗑️</button>
                    </td>
                ` : '';
                tr.innerHTML = `
                    <td><code>${item.code_appareil || '-'}</code></td>
                    <td><strong>${item.nom_equipement || '-'}</strong></td>
                    <td>${item.marque || '-'}</td>
                    <td>${item.modele || '-'}</td>
                    <td>${item.localisation || '-'}</td>
                    <td><span class="badge ${classEtat}">${etat}</span></td>
                    <td>${item.derniere_maintenance || '-'}</td>
                    ${actionTd}
                `;
            }
            tbody.appendChild(tr);
        });
    }

    // Basculer le mode modification
    btnToggleEdit.addEventListener('click', () => {
        isEditMode = !isEditMode;
        editingRowId = null;
        btnToggleEdit.textContent = isEditMode ? '🔒 Quitter le mode édition' : '✏️ Modifier les données';
        btnToggleEdit.className = isEditMode ? 'btn btn-primary' : 'btn btn-secondary';
        afficherMateriel();
    });

    window.activerEditionLigne = function(id) {
        editingRowId = id;
        afficherMateriel();
    };

    window.annulerEdition = function() {
        editingRowId = null;
        afficherMateriel();
    };

    window.validerModification = async function(id) {
        const payload = {
            code_appareil: document.getElementById(`edit-code-${id}`).value.trim(),
            nom_equipement: document.getElementById(`edit-nom-${id}`).value.trim(),
            marque: document.getElementById(`edit-marque-${id}`).value.trim(),
            modele: document.getElementById(`edit-modele-${id}`).value.trim(),
            localisation: document.getElementById(`edit-loc-${id}`).value.trim(),
            etat_fonctionnel: document.getElementById(`edit-etat-${id}`).value,
            derniere_maintenance: document.getElementById(`edit-maint-${id}`).value.trim()
        };

        try {
            const { error } = await _supabase
                .from('materiels')
                .update(payload)
                .eq('id', id);

            if (error) throw error;
            editingRowId = null;
            chargerMateriel();
        } catch (err) {
            alert('Erreur lors de la mise à jour : ' + err.message);
        }
    };

    window.supprimerAppareil = async function(id) {
        if (!confirm('Voulez-vous vraiment supprimer cet appareil ?')) return;
        try {
            const { error } = await _supabase
                .from('materiels')
                .delete()
                .eq('id', id);

            if (error) throw error;
            chargerMateriel();
        } catch (err) {
            alert('Erreur lors de la suppression : ' + err.message);
        }
    };

    // Gestion de la fermeture/ouverture de la Modale
    function fermerModale() {
        modalAjout.style.display = 'none';
        formAjout.reset();
    }

    if (btnOpenModal) btnOpenModal.addEventListener('click', () => modalAjout.style.display = 'flex');
    if (btnCloseModal) btnCloseModal.addEventListener('click', fermerModale);
    if (btnCancelModal) btnCancelModal.addEventListener('click', fermerModale);

    // Fermeture lors d'un clic en dehors du rectangle blanc
    window.addEventListener('click', (e) => {
        if (e.target === modalAjout) fermerModale();
    });

    // Envoi du formulaire d'ajout vers Supabase
    formAjout.addEventListener('submit', async (e) => {
        e.preventDefault();

        let dateMaint = document.getElementById('add-maintenance').value;
        if (dateMaint) {
            const [yyyy, mm, dd] = dateMaint.split('-');
            dateMaint = `${dd}/${mm}/${yyyy}`;
        }

        const nouveauMateriel = {
            code_appareil: document.getElementById('add-code').value.trim(),
            nom_equipement: document.getElementById('add-nom').value.trim(),
            marque: document.getElementById('add-marque').value.trim(),
            modele: document.getElementById('add-modele').value.trim(),
            localisation: document.getElementById('add-localisation').value.trim(),
            etat_fonctionnel: document.getElementById('add-etat').value,
            derniere_maintenance: dateMaint || '-'
        };

        try {
            const { error } = await _supabase
                .from('materiels')
                .insert([nouveauMateriel]);

            if (error) throw error;

            fermerModale();
            chargerMateriel();
        } catch (err) {
            alert("Erreur lors de l'ajout dans Supabase : " + err.message);
        }
    });

    // Écoute en temps réel de Supabase
    _supabase
        .channel('public:materiels')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'materiels' }, () => {
            chargerMateriel();
        })

        */

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
    if (!user) return;

    // Affichage des informations utilisateur
    const userNameEl = document.getElementById('user-name');
    const userRoleEl = document.getElementById('user-role');
    if (userNameEl) userNameEl.textContent = user.nom || 'Utilisateur';
    if (userRoleEl) userRoleEl.textContent = user.service === 'SUPERIEUR' ? 'Accès Direction Supérieure' : 'Responsable Odontologie';

    // Déconnexion
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('chan_session');
            window.location.href = 'login.html';
        });
    }

    const tbody = document.getElementById('tbody-materiel');
    const btnToggleEdit = document.getElementById('btn-toggle-edit');
    const btnOpenModal = document.getElementById('btn-open-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const modalAjout = document.getElementById('modal-ajout');
    const formAjout = document.getElementById('form-ajout-materiel');

    let listeMateriel = [];
    let isEditMode = false;
    let editingRowId = null;

    // Charger les équipements depuis Supabase
    async function chargerMateriel() {
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #64748b; padding: 20px;">Chargement des équipements...</td></tr>`;
        try {
            const { data, error } = await _supabase
                .from('materiels')
                .select('*')
                .order('code_appareil', { ascending: true });

            if (error) throw error;
            listeMateriel = data || [];
            afficherMateriel();
        } catch (err) {
            console.error('Erreur chargement Supabase :', err.message);
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #dc2626; padding: 20px;">Erreur de chargement de la base de données.</td></tr>`;
        }
    }

    // Afficher la liste
    function afficherMateriel() {
        if (!tbody) return;
        tbody.innerHTML = '';
        const colHeader = document.querySelector('.col-actions-header');
        if (colHeader) colHeader.style.display = isEditMode ? 'table-cell' : 'none';

        if (listeMateriel.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${isEditMode ? 8 : 7}" style="text-align: center; color: #64748b; padding: 20px;">Aucun appareil enregistré.</td></tr>`;
            return;
        }

        listeMateriel.forEach((item) => {
            const tr = document.createElement('tr');
            const isEditing = (editingRowId === item.id);

            let classEtat = 'badge-other';
            const etat = item.etat_fonctionnel || 'Opérationnel';
            if (etat === 'En Panne') classEtat = 'badge-red';
            else if (etat === 'Opérationnel') classEtat = 'badge-green';
            else if (etat === 'Sous Maintenance') classEtat = 'badge-purple';

            if (isEditing) {
                tr.innerHTML = `
                    <td><input type="text" id="edit-code-${item.id}" value="${item.code_appareil || ''}" style="width: 100%;"></td>
                    <td><input type="text" id="edit-nom-${item.id}" value="${item.nom_equipement || ''}" style="width: 100%;"></td>
                    <td><input type="text" id="edit-marque-${item.id}" value="${item.marque || ''}" style="width: 100%;"></td>
                    <td><input type="text" id="edit-modele-${item.id}" value="${item.modele || ''}" style="width: 100%;"></td>
                    <td><input type="text" id="edit-loc-${item.id}" value="${item.localisation || ''}" style="width: 100%;"></td>
                    <td>
                        <select id="edit-etat-${item.id}" style="width: 100%;">
                            <option value="Opérationnel" ${etat === 'Opérationnel' ? 'selected' : ''}>Opérationnel</option>
                            <option value="En Panne" ${etat === 'En Panne' ? 'selected' : ''}>En Panne</option>
                            <option value="Sous Maintenance" ${etat === 'Sous Maintenance' ? 'selected' : ''}>Sous Maintenance</option>
                        </select>
                    </td>
                    <td><input type="text" id="edit-maint-${item.id}" value="${item.derniere_maintenance || ''}" style="width: 100%;"></td>
                    <td style="display: flex; gap: 4px;">
                        <button onclick="validerModification('${item.id}')" class="btn" style="background:#16a34a; color:white; padding:4px 8px; font-size:11px;">✔️ Valider</button>
                        <button onclick="annulerEdition()" class="btn btn-secondary" style="padding:4px 8px; font-size:11px;">❌ Annuler</button>
                    </td>
                `;
            } else {
                let actionTd = isEditMode ? `
                    <td>
                        <button onclick="activerEditionLigne('${item.id}')" class="btn btn-primary" style="padding:4px 8px; font-size:11px;">✏️ Modifier</button>
                        <button onclick="supprimerAppareil('${item.id}')" class="btn" style="background:#dc2626; color:white; padding:4px 8px; font-size:11px; margin-left:2px;">🗑️</button>
                    </td>
                ` : '';
                tr.innerHTML = `
                    <td><code>${item.code_appareil || '-'}</code></td>
                    <td><strong>${item.nom_equipement || '-'}</strong></td>
                    <td>${item.marque || '-'}</td>
                    <td>${item.modele || '-'}</td>
                    <td>${item.localisation || '-'}</td>
                    <td><span class="badge ${classEtat}">${etat}</span></td>
                    <td>${item.derniere_maintenance || '-'}</td>
                    ${actionTd}
                `;
            }
            tbody.appendChild(tr);
        });
    }

    // Basculer le mode édition globale
    if (btnToggleEdit) {
        btnToggleEdit.addEventListener('click', () => {
            isEditMode = !isEditMode;
            editingRowId = null;
            btnToggleEdit.textContent = isEditMode ? '🔒 Quitter le mode édition' : '✏️ Modifier les données';
            btnToggleEdit.className = isEditMode ? 'btn btn-primary' : 'btn btn-secondary';
            afficherMateriel();
        });
    }

    window.activerEditionLigne = function(id) {
        editingRowId = id;
        afficherMateriel();
    };

    window.annulerEdition = function() {
        editingRowId = null;
        afficherMateriel();
    };

    window.validerModification = async function(id) {
        const payload = {
            code_appareil: document.getElementById(`edit-code-${id}`).value.trim(),
            nom_equipement: document.getElementById(`edit-nom-${id}`).value.trim(),
            marque: document.getElementById(`edit-marque-${id}`).value.trim(),
            modele: document.getElementById(`edit-modele-${id}`).value.trim(),
            localisation: document.getElementById(`edit-loc-${id}`).value.trim(),
            etat_fonctionnel: document.getElementById(`edit-etat-${id}`).value,
            derniere_maintenance: document.getElementById(`edit-maint-${id}`).value.trim()
        };

        try {
            const { error } = await _supabase.from('materiels').update(payload).eq('id', id);
            if (error) throw error;
            editingRowId = null;
            chargerMateriel();
        } catch (err) {
            alert('Erreur lors de la mise à jour : ' + err.message);
        }
    };

    window.supprimerAppareil = async function(id) {
        if (!confirm('Voulez-vous vraiment supprimer cet appareil ?')) return;
        try {
            const { error } = await _supabase.from('materiels').delete().eq('id', id);
            if (error) throw error;
            chargerMateriel();
        } catch (err) {
            alert('Erreur lors de la suppression : ' + err.message);
        }
    };

    /* ==========================================
       GESTION FERMETURE ET OUVERTURE MODALE
       ========================================== */

    function fermerModale() {
        if (modalAjout) {
            modalAjout.style.display = 'none';
        }
        if (formAjout) {
            formAjout.reset();
        }
    }

    function ouvrirModale() {
        if (modalAjout) {
            modalAjout.style.display = 'flex';
        }
    }

    // Événements d'ouverture et de fermeture
    if (btnOpenModal) btnOpenModal.addEventListener('click', ouvrirModale);
    if (btnCloseModal) btnCloseModal.addEventListener('click', fermerModale);
    if (btnCancelModal) btnCancelModal.addEventListener('click', fermerModale);

    // Clic sur l'arrière-plan sombre pour fermer
    window.addEventListener('click', (e) => {
        if (e.target === modalAjout) {
            fermerModale();
        }
    });

    // Soumission du formulaire d'ajout
    if (formAjout) {
        formAjout.addEventListener('submit', async (e) => {
            e.preventDefault();

            let dateMaint = document.getElementById('add-maintenance').value;
            if (dateMaint && dateMaint.includes('-')) {
                const parts = dateMaint.split('-');
                if (parts.length === 3) {
                    dateMaint = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }

            const nouveauMateriel = {
                code_appareil: document.getElementById('add-code').value.trim(),
                nom_equipement: document.getElementById('add-nom').value.trim(),
                marque: document.getElementById('add-marque').value.trim(),
                modele: document.getElementById('add-modele').value.trim(),
                localisation: document.getElementById('add-localisation').value.trim(),
                etat_fonctionnel: document.getElementById('add-etat').value,
                derniere_maintenance: dateMaint || '-'
            };

            try {
                const { error } = await _supabase.from('materiels').insert([nouveauMateriel]);
                if (error) throw error;

                // Fermer la modale impérativement après succès
                fermerModale();
                chargerMateriel();
            } catch (err) {
                alert("Erreur lors de l'ajout : " + err.message);
            }
        });
    }

    // Écoute en temps réel Supabase
    _supabase
        .channel('public:materiels')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'materiels' }, () => {
            chargerMateriel();
        })
        .subscribe();

    chargerMateriel();
});
        .subscribe();

    chargerMateriel();
});
