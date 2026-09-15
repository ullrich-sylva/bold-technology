// Fonction utilitaire pour sécuriser le rendu HTML contre les failles XSS
function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Redirection si le token expire ou est invalide
function handleAuthError(response) {
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminToken");
        window.location.href = "login.html";
        return true;
    }
    return false;
}

const SERVER_URL = typeof API_URL !== "undefined" ? API_URL.replace("/api", "") : "http://localhost:5000";

// Variables d'état global
let currentActualites = [];
let currentRealisations = [];
let editingActualiteId = null;
let editingRealisationId = null;

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("adminToken");

    // 1. Connexion (login.html)
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const errorMessage = document.getElementById("errorMessage");
            const btnSubmit = document.getElementById("btnSubmit");

            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.textContent = "Connexion en cours...";
            }
            if (errorMessage) errorMessage.textContent = "";

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, mot_de_passe: password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Échec de la connexion");

                localStorage.setItem("adminToken", data.token);
                window.location.href = "dashboard.html";
            } catch (error) {
                if (errorMessage) errorMessage.textContent = error.message;
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = "Se connecter";
                }
            }
        });
    }

    // 2. Dashboard
    const actualitesList = document.getElementById("actualitesList");

    if (actualitesList) {
        if (!token) {
            window.location.href = "login.html";
            return;
        }

        // Navigation entre sections
        const navButtons = document.querySelectorAll(".nav-btn");
        const sections = document.querySelectorAll(".admin-section");

        navButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                navButtons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                sections.forEach((s) => (s.style.display = "none"));

                const sectionTarget = document.getElementById(`section-${btn.dataset.section}`);
                if (sectionTarget) sectionTarget.style.display = "block";

                if (btn.dataset.section === "actualites") loadActualites();
                if (btn.dataset.section === "realisations") loadRealisations();
                if (btn.dataset.section === "messages") loadMessages();
            });
        });

        // Chargement initial
        loadActualites();

        // Déconnexion
        const btnLogout = document.getElementById("btnLogout");
        if (btnLogout) {
            btnLogout.addEventListener("click", () => {
                localStorage.removeItem("adminToken");
                window.location.href = "login.html";
            });
        }

        // ==========================================
        // SOUMISSION ACTUALITÉS (Création & Modification)
        // ==========================================
        const actualiteForm = document.getElementById("actualiteForm");
        if (actualiteForm) {
            actualiteForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const formMessage = document.getElementById("formMessage");
                const submitBtn = document.getElementById("actualiteSubmitBtn");
                const isEditing = editingActualiteId !== null;

                const formData = new FormData();
                formData.append("titre", document.getElementById("titre").value);
                formData.append("contenu", document.getElementById("contenu").value);
                formData.append("date_publication", document.getElementById("date_publication").value);

                const imageInput = document.getElementById("image");
                if (imageInput && imageInput.files[0]) {
                    formData.append("image", imageInput.files[0]);
                }

                const url = isEditing ? `${API_URL}/actualites/${editingActualiteId}` : `${API_URL}/actualites`;
                const method = isEditing ? "PUT" : "POST";

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Enregistrement en cours...";
                }

                try {
                    const response = await fetch(url, {
                        method: method,
                        headers: { "Authorization": `Bearer ${token}` },
                        body: formData
                    });

                    if (handleAuthError(response)) return;

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message || "Erreur lors de l'enregistrement");

                    formMessage.style.color = "#4ade80";
                    formMessage.textContent = isEditing ? "Actualité modifiée avec succès !" : "Actualité ajoutée avec succès !";
                    
                    resetActualiteForm();
                    loadActualites();
                } catch (error) {
                    formMessage.style.color = "#f87171";
                    formMessage.textContent = error.message;
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = isEditing ? "Enregistrer les modifications" : "Publier l'actualité";
                    }
                }
            });

            const cancelActualiteBtn = document.getElementById("cancelActualiteBtn");
            if (cancelActualiteBtn) {
                cancelActualiteBtn.addEventListener("click", resetActualiteForm);
            }
        }

        // ==========================================
        // SOUMISSION RÉALISATIONS (Création & Modification)
        // ==========================================
        const realisationForm = document.getElementById("realisationForm");
        if (realisationForm) {
            realisationForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const formMessage = document.getElementById("realisationFormMessage");
                const submitBtn = document.getElementById("realisationSubmitBtn");
                const isEditing = editingRealisationId !== null;

                const formData = new FormData();
                formData.append("titre", document.getElementById("r_titre").value);
                formData.append("description", document.getElementById("r_description").value);
                formData.append("client", document.getElementById("r_client").value);
                formData.append("date_realisation", document.getElementById("r_date_realisation").value);

                const photoInput = document.getElementById("r_photo");
                if (photoInput && photoInput.files[0]) {
                    formData.append("photo", photoInput.files[0]);
                }

                const videoInput = document.getElementById("r_video");
                if (videoInput && videoInput.files[0]) {
                    formData.append("video", videoInput.files[0]);
                }

                const url = isEditing ? `${API_URL}/realisations/${editingRealisationId}` : `${API_URL}/realisations`;
                const method = isEditing ? "PUT" : "POST";

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Téléversement et enregistrement...";
                }

                try {
                    const response = await fetch(url, {
                        method: method,
                        headers: { "Authorization": `Bearer ${token}` },
                        body: formData
                    });

                    if (handleAuthError(response)) return;

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message || "Erreur lors de l'enregistrement");

                    formMessage.style.color = "#4ade80";
                    formMessage.textContent = isEditing ? "Réalisation modifiée avec succès !" : "Réalisation ajoutée avec succès !";
                    
                    resetRealisationForm();
                    loadRealisations();
                } catch (error) {
                    formMessage.style.color = "#f87171";
                    formMessage.textContent = error.message;
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = isEditing ? "Enregistrer les modifications" : "Publier la réalisation";
                    }
                }
            });

            const cancelRealisationBtn = document.getElementById("cancelRealisationBtn");
            if (cancelRealisationBtn) {
                cancelRealisationBtn.addEventListener("click", resetRealisationForm);
            }
        }
    }
});

// ==========================================
// LOGIQUE ACTUALITÉS
// ==========================================
async function loadActualites() {
    const container = document.getElementById("actualitesList");
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/actualites`);
        if (!response.ok) throw new Error("Erreur de chargement des actualités");

        currentActualites = await response.json();

        if (currentActualites.length === 0) {
            container.innerHTML = "<p>Aucune actualité publiée pour le moment.</p>";
            return;
        }

        container.innerHTML = currentActualites.map(actu => `
            <div class="item-card">
                <div class="item-info">
                    ${actu.image ? `<img src="${SERVER_URL}/uploads/${escapeHTML(actu.image)}" alt="${escapeHTML(actu.titre)}">` : ''}
                    <div>
                        <h4>${escapeHTML(actu.titre)}</h4>
                        <small style="color: #94a3b8;">${actu.date_publication ? new Date(actu.date_publication).toLocaleDateString('fr-FR') : ''}</small>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="startEditActualite(${actu.id})">Éditer</button>
                    <button class="btn-danger" onclick="deleteActualite(${actu.id})">Supprimer</button>
                </div>
            </div>
        `).join("");
    } catch (error) {
        container.innerHTML = "<p style='color:#f87171;'>Impossible de charger les actualités.</p>";
    }
}

function startEditActualite(id) {
    const actu = currentActualites.find(a => a.id === id);
    if (!actu) return;

    editingActualiteId = id;
    document.getElementById("actualiteFormTitle").textContent = "Modifier l'Actualité";
    document.getElementById("actualiteSubmitBtn").textContent = "Enregistrer les modifications";
    document.getElementById("cancelActualiteBtn").style.display = "inline-block";

    document.getElementById("titre").value = actu.titre || "";
    document.getElementById("contenu").value = actu.contenu || "";
    
    if (actu.date_publication) {
        const formattedDate = new Date(actu.date_publication).toISOString().split('T')[0];
        document.getElementById("date_publication").value = formattedDate;
    }

    document.getElementById("actualiteForm").scrollIntoView({ behavior: 'smooth' });
}

function resetActualiteForm() {
    editingActualiteId = null;
    const formTitle = document.getElementById("actualiteFormTitle");
    const submitBtn = document.getElementById("actualiteSubmitBtn");
    const cancelBtn = document.getElementById("cancelActualiteBtn");
    const formMessage = document.getElementById("formMessage");

    if (formTitle) formTitle.textContent = "Ajouter une Actualité";
    if (submitBtn) submitBtn.textContent = "Publier l'actualité";
    if (cancelBtn) cancelBtn.style.display = "none";
    if (formMessage) formMessage.textContent = "";

    const form = document.getElementById("actualiteForm");
    if (form) form.reset();
}

async function deleteActualite(id) {
    if (!confirm("Voulez-vous vraiment supprimer cette actualité ?")) return;
    const token = localStorage.getItem("adminToken");
    try {
        const response = await fetch(`${API_URL}/actualites/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (handleAuthError(response)) return;
        if (!response.ok) throw new Error("Erreur lors de la suppression");

        if (editingActualiteId === id) resetActualiteForm();
        loadActualites();
    } catch (error) {
        alert(error.message);
    }
}

// ==========================================
// LOGIQUE RÉALISATIONS
// ==========================================
async function loadRealisations() {
    const container = document.getElementById("realisationsList");
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/realisations`);
        if (!response.ok) throw new Error("Erreur de chargement des réalisations");

        currentRealisations = await response.json();

        if (currentRealisations.length === 0) {
            container.innerHTML = "<p>Aucune réalisation publiée pour le moment.</p>";
            return;
        }

        container.innerHTML = currentRealisations.map(r => {
            const imgFile = r.photo || r.image;
            return `
            <div class="item-card">
                <div class="item-info">
                    ${imgFile ? `<img src="${SERVER_URL}/uploads/${escapeHTML(imgFile)}" alt="${escapeHTML(r.titre)}">` : ''}
                    <div>
                        <h4>${escapeHTML(r.titre)}</h4>
                        <small style="color: #94a3b8;">
                            ${r.client ? escapeHTML(r.client) + ' — ' : ''}
                            ${r.date_realisation ? new Date(r.date_realisation).toLocaleDateString('fr-FR') : ''}
                            ${r.video ? ' — 🎬 Vidéo jointe' : ''}
                        </small>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="startEditRealisation(${r.id})">Éditer</button>
                    <button class="btn-danger" onclick="deleteRealisation(${r.id})">Supprimer</button>
                </div>
            </div>
            `;
        }).join("");
    } catch (error) {
        container.innerHTML = "<p style='color:#f87171;'>Impossible de charger les réalisations.</p>";
    }
}

function startEditRealisation(id) {
    const r = currentRealisations.find(item => item.id === id);
    if (!r) return;

    editingRealisationId = id;
    document.getElementById("realisationFormTitle").textContent = "Modifier la Réalisation";
    document.getElementById("realisationSubmitBtn").textContent = "Enregistrer les modifications";
    document.getElementById("cancelRealisationBtn").style.display = "inline-block";

    document.getElementById("r_titre").value = r.titre || "";
    document.getElementById("r_description").value = r.description || "";
    document.getElementById("r_client").value = r.client || "";

    if (r.date_realisation) {
        const formattedDate = new Date(r.date_realisation).toISOString().split('T')[0];
        document.getElementById("r_date_realisation").value = formattedDate;
    }

    document.getElementById("realisationForm").scrollIntoView({ behavior: 'smooth' });
}

function resetRealisationForm() {
    editingRealisationId = null;
    const formTitle = document.getElementById("realisationFormTitle");
    const submitBtn = document.getElementById("realisationSubmitBtn");
    const cancelBtn = document.getElementById("cancelRealisationBtn");
    const formMessage = document.getElementById("realisationFormMessage");

    if (formTitle) formTitle.textContent = "Ajouter une Réalisation";
    if (submitBtn) submitBtn.textContent = "Publier la réalisation";
    if (cancelBtn) cancelBtn.style.display = "none";
    if (formMessage) formMessage.textContent = "";

    const form = document.getElementById("realisationForm");
    if (form) form.reset();
}

async function deleteRealisation(id) {
    if (!confirm("Voulez-vous vraiment supprimer cette réalisation ?")) return;
    const token = localStorage.getItem("adminToken");
    try {
        const response = await fetch(`${API_URL}/realisations/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (handleAuthError(response)) return;
        if (!response.ok) throw new Error("Erreur lors de la suppression");

        if (editingRealisationId === id) resetRealisationForm();
        loadRealisations();
    } catch (error) {
        alert(error.message);
    }
}

// ==========================================
// LOGIQUE MESSAGES
// ==========================================
async function loadMessages() {
    const container = document.getElementById("messagesList");
    if (!container) return;
    const token = localStorage.getItem("adminToken");

    try {
        const response = await fetch(`${API_URL}/messages`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (handleAuthError(response)) return;

        const messages = await response.json();

        if (!response.ok) throw new Error(messages.message || "Erreur lors du chargement");
        if (messages.length === 0) {
            container.innerHTML = "<p>Aucun message reçu pour le moment.</p>";
            return;
        }

        container.innerHTML = messages.map(m => {
            const subjectEncoded = encodeURIComponent("Re: " + (m.sujet || "Votre message"));
            const mailtoUrl = `mailto:${escapeHTML(m.email)}?subject=${subjectEncoded}`;

            return `
            <div class="message-card">
                <div class="message-card-header">
                    <div>
                        <h4>${escapeHTML(m.nom)} — <span class="msg-meta">${escapeHTML(m.email)}</span></h4>
                        <span class="msg-meta">
                            ${m.telephone ? escapeHTML(m.telephone) + ' — ' : ''}
                            ${m.created_at ? new Date(m.created_at).toLocaleDateString('fr-FR') : ''}
                            ${m.sujet ? ' — ' + escapeHTML(m.sujet) : ''}
                        </span>
                    </div>
                    <span class="status-badge ${escapeHTML(m.statut)}">${m.statut ? escapeHTML(m.statut.replace('_', ' ')) : ''}</span>
                </div>
                <p class="msg-text">${escapeHTML(m.message)}</p>
                <div class="message-actions">
                    <a href="${mailtoUrl}" class="btn-reply">Répondre</a>
                    ${m.statut !== 'lu' ? `<button class="btn-status-lu" onclick="updateStatut(${m.id}, 'lu')">Marquer comme lu</button>` : ''}
                    ${m.statut !== 'traite' ? `<button class="btn-status-traite" onclick="updateStatut(${m.id}, 'traite')">Marquer comme traité</button>` : ''}
                    <button class="btn-danger" onclick="deleteMessage(${m.id})">Supprimer</button>
                </div>
            </div>
            `;
        }).join("");
    } catch (error) {
        container.innerHTML = `<p style='color:#f87171;'>${error.message}</p>`;
    }
}

async function updateStatut(id, statut) {
    const token = localStorage.getItem("adminToken");
    try {
        const response = await fetch(`${API_URL}/messages/${id}/statut`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ statut })
        });

        if (handleAuthError(response)) return;
        if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut");

        loadMessages();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteMessage(id) {
    if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;
    const token = localStorage.getItem("adminToken");
    try {
        const response = await fetch(`${API_URL}/messages/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (handleAuthError(response)) return;
        if (!response.ok) throw new Error("Erreur lors de la suppression");

        loadMessages();
    } catch (error) {
        alert(error.message);
    }
}