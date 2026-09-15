// URL de base du serveur (images)
const SERVER_URL = typeof API_URL !== 'undefined' ? API_URL.replace('/api', '') : 'http://localhost:5000';

// =============================================
// UTILITAIRES
// =============================================

function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
}

function truncate(text, maxLength) {
    maxLength = maxLength || 180;
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function buildCard(item, type) {
    var safeTitre = escapeHTML(item.titre);
    var imgHtml = item.image
        ? '<img src="' + SERVER_URL + '/uploads/' + encodeURIComponent(item.image) + '" alt="' + safeTitre + '" class="card-img" onerror="this.onerror=null;this.outerHTML=\'<div class=\\\'card-img-placeholder\\\'><i class=\\\'fa-solid fa-image\\\' style=\\\'font-size:2rem;color:var(--primary);opacity:0.6;\\\'></i></div>\';">'
        : '<div class="card-img-placeholder"><i class="fa-solid fa-image" style="font-size:2rem;color:var(--primary);opacity:0.6;"></i></div>';

    var metaHtml = '';
    if (type === 'realisation') {
        if (item.client) metaHtml += '<p class="card-meta">Client : ' + escapeHTML(item.client) + '</p>';
        if (item.date_realisation) metaHtml += '<span class="card-date">' + formatDate(item.date_realisation) + '</span>';
    } else if (type === 'actualite') {
        if (item.date_publication) metaHtml += '<span class="card-date">' + formatDate(item.date_publication) + '</span>';
    }

    var textContent = type === 'actualite' ? (item.contenu || '') : (item.description || '');
    var safeText = escapeHTML(truncate(textContent, 200));

    return '<div class="public-card">' +
        imgHtml +
        '<div class="card-body">' +
        metaHtml +
        '<h3>' + safeTitre + '</h3>' +
        '<p class="card-text">' + safeText + '</p>' +
        '</div>' +
        '</div>';
}

// =============================================
// PAGE ACCUEIL
// =============================================

async function loadRealisationsHome() {
    var container = document.getElementById('realisationsHome');
    if (!container) return;
    try {
        var response = await fetch(API_URL + '/realisations');
        if (!response.ok) throw new Error('Erreur réseau');
        var data = await response.json();
        var items = data.slice(0, 3);
        if (items.length === 0) {
            container.innerHTML = '<p class="empty-text">Aucune réalisation disponible.</p>';
            return;
        }
        container.innerHTML = items.map(function(item) { return buildCard(item, 'realisation'); }).join('');
    } catch (err) {
        container.innerHTML = '<p class="error-text">Impossible de charger les réalisations.</p>';
    }
}

async function loadActualitesHome() {
    var container = document.getElementById('actualitesHome');
    if (!container) return;
    try {
        var response = await fetch(API_URL + '/actualites');
        if (!response.ok) throw new Error('Erreur réseau');
        var data = await response.json();
        var items = data.slice(0, 3);
        if (items.length === 0) {
            container.innerHTML = '<p class="empty-text">Aucune actualité disponible.</p>';
            return;
        }
        container.innerHTML = items.map(function(item) { return buildCard(item, 'actualite'); }).join('');
    } catch (err) {
        container.innerHTML = '<p class="error-text">Impossible de charger les actualités.</p>';
    }
}

// =============================================
// PAGE REALISATIONS
// =============================================

async function loadAllRealisations() {
    var container = document.getElementById('realisationsList');
    if (!container) return;
    try {
        var response = await fetch(API_URL + '/realisations');
        if (!response.ok) throw new Error('Erreur réseau');
        var items = await response.json();
        if (items.length === 0) {
            container.innerHTML = '<p class="empty-text">Aucune réalisation disponible pour le moment.</p>';
            return;
        }
        container.innerHTML = items.map(function(item) { return buildCard(item, 'realisation'); }).join('');
    } catch (err) {
        container.innerHTML = '<p class="error-text">Impossible de charger les réalisations.</p>';
    }
}

// =============================================
// PAGE ACTUALITES
// =============================================

async function loadAllActualites() {
    var container = document.getElementById('actualitesList');
    if (!container) return;
    try {
        var response = await fetch(API_URL + '/actualites');
        if (!response.ok) throw new Error('Erreur réseau');
        var items = await response.json();
        if (items.length === 0) {
            container.innerHTML = '<p class="empty-text">Aucune actualité disponible pour le moment.</p>';
            return;
        }
        container.innerHTML = items.map(function(item) { return buildCard(item, 'actualite'); }).join('');
    } catch (err) {
        container.innerHTML = '<p class="error-text">Impossible de charger les actualités.</p>';
    }
}

// =============================================
// PAGE CONTACT
// =============================================

function handleContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var formMessage = document.getElementById('formMessage');
        var btnSubmit = document.getElementById('btnSubmit');

        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Envoi en cours...';
        formMessage.textContent = '';

        var payload = {
            nom: document.getElementById('nom').value,
            email: document.getElementById('email').value,
            telephone: document.getElementById('telephone').value || null,
            type_demande: document.getElementById('type_demande').value,
            sujet: document.getElementById('sujet').value || null,
            message: document.getElementById('message').value
        };

        try {
            var response = await fetch(API_URL + '/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            var data = await response.json();
            if (!response.ok) throw new Error(data.message || "Erreur lors de l'envoi");

            formMessage.style.color = '#4ade80';
            formMessage.textContent = 'Votre message a bien ete envoye ! Nous vous repondrons dans les plus brefs delais.';
            form.reset();
        } catch (err) {
            formMessage.style.color = '#f87171';
            formMessage.textContent = err.message;
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Envoyer le message';
        }
    });
}

// =============================================
// INITIALISATION
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    // Page Accueil
    loadRealisationsHome();
    loadActualitesHome();

    // Page Realisations
    loadAllRealisations();

    // Page Actualites (public uniquement — pas le dashboard admin)
    var isAdminPage = document.querySelector('.dashboard-layout') !== null;
    if (!isAdminPage) {
        loadAllActualites();
    }

    // Page Contact
    handleContactForm();
});
