const db = require("../config/database");


// ==========================================
// AFFICHER TOUTES LES REALISATIONS
// GET /api/realisations
// ==========================================

const getAllRealisations = (req, res) => {

    const sql = "SELECT * FROM realisations ORDER BY created_at DESC";

    db.query(sql, (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erreur lors de la récupération des réalisations"
            });
        }

        res.status(200).json(results);
    });
};


// ==========================================
// AFFICHER UNE REALISATION PAR ID
// GET /api/realisations/:id
// ==========================================

const getRealisationById = (req, res) => {

    const { id } = req.params;

    const sql = "SELECT * FROM realisations WHERE id = ?";

    db.query(sql, [id], (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erreur lors de la récupération de la réalisation"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Réalisation introuvable"
            });
        }

        res.status(200).json(results[0]);
    });
};


// ==========================================
// AJOUTER UNE REALISATION
// POST /api/realisations
// ==========================================

const createRealisation = (req, res) => {

    const {
        titre,
        description,
        image,
        client,
        date_realisation
    } = req.body;

    // Vérification des champs obligatoires
    if (!titre || !description) {
        return res.status(400).json({
            message: "Le titre et la description sont obligatoires"
        });
    }

    const sql = `
        INSERT INTO realisations
        (titre, description, image, client, date_realisation)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            titre,
            description,
            image || null,
            client || null,
            date_realisation || null
        ],
        (error, results) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    message: "Erreur lors de l'ajout de la réalisation"
                });
            }

            res.status(201).json({
                message: "Réalisation ajoutée avec succès",
                id: results.insertId
            });
        }
    );
};


// ==========================================
// MODIFIER UNE REALISATION
// PUT /api/realisations/:id
// ==========================================

const updateRealisation = (req, res) => {

    const { id } = req.params;

    const {
        titre,
        description,
        image,
        client,
        date_realisation
    } = req.body;

    const sql = `
        UPDATE realisations
        SET
            titre = ?,
            description = ?,
            image = ?,
            client = ?,
            date_realisation = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            titre,
            description,
            image || null,
            client || null,
            date_realisation || null,
            id
        ],
        (error, results) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    message: "Erreur lors de la modification"
                });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({
                    message: "Réalisation introuvable"
                });
            }

            res.status(200).json({
                message: "Réalisation modifiée avec succès"
            });
        }
    );
};


// ==========================================
// SUPPRIMER UNE REALISATION
// DELETE /api/realisations/:id
// ==========================================

const deleteRealisation = (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM realisations WHERE id = ?";

    db.query(sql, [id], (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erreur lors de la suppression"
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: "Réalisation introuvable"
            });
        }

        res.status(200).json({
            message: "Réalisation supprimée avec succès"
        });
    });
};


module.exports = {
    getAllRealisations,
    getRealisationById,
    createRealisation,
    updateRealisation,
    deleteRealisation
};