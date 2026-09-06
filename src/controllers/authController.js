const db = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// ==========================================
// CONNEXION ADMINISTRATEUR
// POST /api/auth/login
// ==========================================

const login = (req, res) => {

    const { email, mot_de_passe } = req.body;


    // Vérifier les champs
    if (!email || !mot_de_passe) {
        return res.status(400).json({
            message: "Email et mot de passe obligatoires"
        });
    }


    // Rechercher l'administrateur
    const sql = "SELECT * FROM admins WHERE email = ?";

    db.query(sql, [email], async (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erreur serveur"
            });
        }


        // Vérifier si l'administrateur existe
        if (results.length === 0) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }


        const administrateur = results[0];


        // Comparer le mot de passe
        const motDePasseCorrect = await bcrypt.compare(
            mot_de_passe,
            administrateur.mot_de_passe
        );


        if (!motDePasseCorrect) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }


        // Créer le token JWT
        const token = jwt.sign(
            {
                id: administrateur.id,
                email: administrateur.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );


        res.status(200).json({
            message: "Connexion réussie",
            token: token,
            administrateur: {
                id: administrateur.id,
                nom: administrateur.nom,
                email: administrateur.email
            }
        });

    });
};


module.exports = {
    login
};