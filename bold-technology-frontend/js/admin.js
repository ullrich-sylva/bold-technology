document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("adminToken");

    // 1. Gestion de la page de Connexion (login.html)
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const errorMessage = document.getElementById("errorMessage");

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    // ✅ Correction : le backend attend "mot_de_passe"
                    body: JSON.stringify({ email, mot_de_passe: password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Échec de la connexion");

                localStorage.setItem("adminToken", data.token);
                window.location.href = "dashboard.html";
            } catch (error) {
                errorMessage.textContent = error.message;
            }
        });
    }

    // 2. Protection de la page Dashboard (dashboard.html)
    const actualitesList = document.getElementById("actualitesList");
    if (actualitesList) {
        if (!token) {
            window.location.href = "login.html";
            return;
        }

        // Charger la liste des actualités
        loadActualites();

        // Gestion de la déconnexion
        document.getElementById("btnLogout").addEventListener("click", () => {
            localStorage.removeItem("adminToken");
            window.location.href = "login.html";
        });

        // Soumission du formulaire d'ajout avec upload d'image
        const actualiteForm = document.getElementById("actualiteForm");
        actualiteForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formMessage = document.getElementById("formMessage");

            const formData = new FormData();
            formData.append("titre", document.getElementById("titre").value);
            formData.append("contenu", document.getElementById("contenu").value);
            formData.append("date_publication", document.getElementById("date_publication").value);

            const imageFile = document.getElementById("image").files[0];
            if (imageFile) {
                formData.append("image", imageFile);
            }

            try {
                const response = await fetch(`${API_URL}/actualites`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Erreur lors de la création");

                formMessage.style.color = "#4ade80";
                formMessage.textContent = "Actualité ajoutée avec succès !";
                actualiteForm.reset();
                loadActualites(); // Rafraîchir la liste
            } catch (error) {
                formMessage.style.color = "#f87171";
                formMessage.textContent = error.message;
            }
        });
    }
});

// Extraire l'URL de base du serveur depuis API_URL (ex: "http://localhost:5000")
const SERVER_URL = typeof API_URL !== "undefined" ? API_URL.replace("/api", "") : "http://localhost:5000";

// Fonction pour récupérer et afficher les actualités
async function loadActualites() {
    const container = document.getElementById("actualitesList");
    try {
        const response = await fetch(`${API_URL}/actualites`);
        const actualites = await response.json();

        if (actualites.length === 0) {
            container.innerHTML = "<p>Aucune actualité publiée pour le moment.</p>";
            return;
        }

        container.innerHTML = actualites.map(actu => `
            <div class="item-card">
                <div class="item-info">
                    ${actu.image ? `<img src="${SERVER_URL}/uploads/${actu.image}" alt="${actu.titre}">` : ''}
                    <div>
                        <h4>${actu.titre}</h4>
                        <small style="color: #94a3b8;">${new Date(actu.date_publication).toLocaleDateString('fr-FR')}</small>
                    </div>
                </div>
                <button class="btn-danger" onclick="deleteActualite(${actu.id})">Supprimer</button>
            </div>
        `).join("");
    } catch (error) {
        container.innerHTML = "<p style='color:#f87171;'>Impossible de charger les actualités.</p>";
    }
}

// Fonction pour supprimer une actualité
async function deleteActualite(id) {
    if (!confirm("Voulez-vous vraiment supprimer cette actualité ?")) return;

    const token = localStorage.getItem("adminToken");
    try {
        const response = await fetch(`${API_URL}/actualites/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Erreur lors de la suppression");

        loadActualites(); // Recharger la liste
    } catch (error) {
        alert(error.message);
    }
}