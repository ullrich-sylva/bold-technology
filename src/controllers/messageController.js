const db = require("../config/database");

// Regex simple, suffisante pour valider un format d'email sans dépendance externe
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// ==========================================
// RECUPERER TOUS LES MESSAGES
// GET /api/messages
// ==========================================

const getAllMessages = (req, res) => {

    const sql = `
        SELECT *
        FROM messages
        ORDER BY created_at DESC
    `;

    db.query(sql, (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erreur lors de la récupération des messages"
            });
        }

        res.status(200).json(results);
    });
};


// ==========================================
// RECUPERER UN MESSAGE PAR ID
// GET /api/messages/:id
// ==========================================

const getMessageById = (req, res) => {

    const { id } = req.params;

    const sql = "SELECT * FROM messages WHERE id = ?";

    db.query(sql, [id], (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erreur lors de la récupération du message"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Message introuvable"
            });
        }

        res.status(200).json(results[0]);
    });
};


// ==========================================
// ENVOYER UN MESSAGE
// POST /api/messages
// ==========================================

const createMessage = (req, res) => {

    const {
        nom,
        email,
        telephone,
        sujet,
        type_demande,
        message
    } = req.body;


    // Vérification des champs obligatoires
    if (!nom || !email || !message) {
        return res.status(400).json({
            message: "Le nom, l'email et le message sont obligatoires"
        });
    }


    // Validation du format email
    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({
            message: "Format d'email invalide"
        });
    }


    // Limites de longueur pour éviter le spam volumineux ou les abus de stockage
    if (nom.length > 100) {
        return res.status(400).json({
            message: "Le nom ne doit pas dépasser 100 caractères"
        });
    }

    if (sujet && sujet.length > 200) {
        return res.status(400).json({
            message: "Le sujet ne doit pas dépasser 200 caractères"
        });
    }

    if (message.length > 5000) {
        return res.status(400).json({
            message: "Le message ne doit pas dépasser 5000 caractères"
        });
    }


    const sql = `
        INSERT INTO messages
        (
            nom,
            email,
            telephone,
            sujet,
            type_demande,
            message
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            nom,
            email,
            telephone || null,
            sujet || null,
            type_demande || "contact",
            message
        ],
        (error, results) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    message: "Erreur lors de l'envoi du message"
                });
            }

            res.status(201).json({
                message: "Message envoyé avec succès",
                id: results.insertId
            });
        }
    );
};


// ==========================================
// MODIFIER LE STATUT
// PUT /api/messages/:id/statut
// ==========================================

const updateMessageStatut = (req, res) => {

    const { id } = req.params;

    const { statut } = req.body;


    const statutsAutorises = [
        "non_lu",
        "lu",
        "traite"
    ];


    if (!statutsAutorises.includes(statut)) {
        return res.status(400).json({
            message: "Statut invalide"
        });
    }


    const sql = `
        UPDATE messages
        SET statut = ?
        WHERE id = ?
    `;


    db.query(
        sql,
        [statut, id],
        (error, results) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    message: "Erreur lors de la modification du statut"
                });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({
                    message: "Message introuvable"
                });
            }

            res.status(200).json({
                message: "Statut modifié avec succès"
            });
        }
    );
};


// ==========================================
// SUPPRIMER UN MESSAGE
// DELETE /api/messages/:id
// ==========================================

const deleteMessage = (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM messages WHERE id = ?";


    db.query(sql, [id], (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erreur lors de la suppression"
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: "Message introuvable"
            });
        }

        res.status(200).json({
            message: "Message supprimé avec succès"
        });
    });
};


module.exports = {
    getAllMessages,
    getMessageById,
    createMessage,
    updateMessageStatut,
    deleteMessage
};