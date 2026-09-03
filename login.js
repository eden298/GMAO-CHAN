 /*OPTION1
 // Liste des utilisateurs autorisés
const databaseUsers = [
    { id: 'DIR', password: 'dir123', nom: 'M. le Directeur', service: 'TOUS' },
    { id: 'MAINT', password: 'maint123', nom: 'Responsable Maintenance', service: 'TOUS' },
    { id: 'SUP', password: 'sup1234', nom: 'Direction Supérieure', service: 'SUPERIEUR' },
    { id: 'CAD-ODONTO', password: 'odonto123', nom: 'Major Odontologie', service: 'Odontologie' },
    { id: 'CAD-URG', password: 'urg123', nom: 'Major Urgences', service: 'Urgences' },
    { id: 'CAD-MAT', password: 'mat123', nom: 'Major Maternité', service: 'Maternité' },
    { id: 'CAD-PED', password: 'ped123', nom: 'Major Pédiatrie', service: 'Pédiatrie' },
    { id: 'CAD-BLOC', password: 'bloc123', nom: 'Major Bloc Opératoire', service: 'Bloc Opératoire' }
];

// Table de correspondance pour la redirection
const pagesParService = {
    'TOUS': 'index.html',
    'SUPERIEUR': 'superieur.html',
    'Odontologie': 'odonto.html',
    'Urgences': 'urgences.html',
    'Maternité': 'maternite.html',
    'Pédiatrie': 'pediatrie.html',
    'Bloc Opératoire': 'bloc.html'
};

// Fonction de validation
function traiterConnexion(idSaisi, passwordSaisi) {
    if (!idSaisi || !passwordSaisi) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    // Recherche de l'utilisateur (nettoyage des espaces et majuscules automatiques pour l'ID)
    const idPropre = idSaisi.trim().toUpperCase();
    const passPropre = passwordSaisi.trim();

    const user = databaseUsers.find(u => u.id === idPropre && u.password === passPropre);

    if (user) {
        // Enregistrement de la session
        localStorage.setItem('chan_session', JSON.stringify(user));

        // Redirection vers la page correspondante
        const destination = pagesParService[user.service] || 'index.html';
        window.location.href = destination;
    } else {
        alert("ID personnel ou mot de passe incorrect.");
    }
}

// Écouteur d'événement sur le formulaire de connexion
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Empêche le rechargement de la page HTML
            
            const inputId = document.querySelector('#id, #username, input[type="text"]');
            const inputPass = document.querySelector('#password, input[type="password"]');

            if (inputId && inputPass) {
                traiterConnexion(inputId.value, inputPass.value);
            }
        });
    }
});

*/

/*OPTION2*/

// Liste des utilisateurs autorisés
const databaseUsers = [
    { id: 'DIR', password: 'dir123', nom: 'M. le Directeur', service: 'TOUS' },
    { id: 'MAINT', password: 'maint123', nom: 'Responsable Maintenance', service: 'TOUS' },
    { id: 'SUP', password: 'sup1234', nom: 'Direction Supérieure', service: 'SUPERIEUR' },
    { id: 'CAD-ODONTO', password: 'odonto123', nom: 'Major Odontologie', service: 'Odontologie' },
    { id: 'CAD-ODONTO2', password: 'odonto2123', nom: 'Major Odontologie 2', service: 'Odonto' },
    { id: 'CAD-URG', password: 'urg123', nom: 'Major Urgences', service: 'Urgences' },
    { id: 'CAD-MAT', password: 'mat123', nom: 'Major Maternité', service: 'Maternité' },
    { id: 'CAD-PED', password: 'ped123', nom: 'Major Pédiatrie', service: 'Pédiatrie' },
    { id: 'CAD-BLOC', password: 'bloc123', nom: 'Major Bloc Opératoire', service: 'Bloc Opératoire' }
];

// Table de correspondance pour la redirection
const pagesParService = {
    'TOUS': 'index.html',
    'SUPERIEUR': 'superieur.html',
    'Odontologie': 'odonto2.html',
     'Odonto': 'odonto2.html',
    'Urgences': 'urgences.html',
    'Maternité': 'maternite.html',
    'Pédiatrie': 'pediatrie.html',
    'Bloc Opératoire': 'bloc.html'
};

// Traitement de la connexion
function traiterConnexion(idSaisi, passwordSaisi) {
    const errorMsg = document.getElementById('error-message');
    errorMsg.style.display = 'none';

    if (!idSaisi || !passwordSaisi) {
        afficherErreur("Veuillez remplir tous les champs.");
        return;
    }

    const idPropre = idSaisi.trim().toUpperCase();
    const passPropre = passwordSaisi.trim();

    const user = databaseUsers.find(u => u.id === idPropre && u.password === passPropre);

    if (user) {
        // Enregistrement de la session
        localStorage.setItem('chan_session', JSON.stringify(user));

        // Redirection vers la page correspondante
        const destination = pagesParService[user.service] || 'index.html';
        window.location.href = destination;
    } else {
        afficherErreur("ID personnel ou mot de passe incorrect.");
    }
}

function afficherErreur(message) {
    const errorMsg = document.getElementById('error-message');
    if (errorMsg) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
    }
}

// Écouteurs d'événements DOM
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const resetForm = document.getElementById('reset-form');
    const linkForgot = document.getElementById('link-forgot');
    const linkBackLogin = document.getElementById('link-back-login');
    const resetSuccessMsg = document.getElementById('reset-success-message');

    // Gestion de la soumission de connexion
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputId = document.getElementById('username');
            const inputPass = document.getElementById('password');

            if (inputId && inputPass) {
                traiterConnexion(inputId.value, inputPass.value);
            }
        });
    }

    // Basculer vers le formulaire de réinitialisation
    if (linkForgot) {
        linkForgot.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            resetForm.style.display = 'block';
        });
    }

    // Retourner vers la connexion
    if (linkBackLogin) {
        linkBackLogin.addEventListener('click', (e) => {
            e.preventDefault();
            resetForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    // Simulation de réinitialisation
    if (resetForm) {
        resetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            resetSuccessMsg.textContent = "Un message a été envoyé à l'administrateur système pour réinitialiser vos accès.";
            resetSuccessMsg.style.display = 'block';
            document.getElementById('reset-username').value = '';
        });
    }
});