const db = require("../config/database");

// Au lieu de "../middlewares/authMiddleware"
const verifyToken = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
// ==========================================
// AFFICHER TOUTES LES ACTUALITES
// GET /api/actualites
// ==========================================

const getAllActualites = (req, res) => {

    const sql = `
        SELECT *
        FROM actualites
        ORDER BY date_publication DESC
    `;

    db.query(sql, (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erreur lors de la récupération des actualités"
            });
        }

        res.status(200).json(results);
    });
};


// ==========================================
// AFFICHER UNE ACTUALITE PAR ID
// GET /api/actualites/:id
// ==========================================

const getActualiteById = (req, res) => {

    const { id } = req.params;

    const sql = "SELECT * FROM actualites WHERE id = ?";

    db.query(sql, [id], (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erreur lors de la récupération de l'actualité"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Actualité introuvable"
            });
        }

        res.status(200).json(results[0]);
    });
};


// ==========================================
// AJOUTER UNE ACTUALITE
// POST /api/actualites
// ==========================================

const createActualite = (req, res) => {

    const {
        titre,
        contenu,
        date_publication
    } = req.body;
    

    if (!titre || !contenu || !date_publication) {
        return res.status(400).json({
            message: "Le titre, le contenu et la date sont obligatoires"
        });
    }

    const image = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO actualites
        (titre, contenu, image, date_publication)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            titre,
            contenu,
            image || null,
            date_publication
        ],
        (error, results) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    message: "Erreur lors de l'ajout de l'actualité"
                });
            }

            res.status(201).json({
                message: "Actualité ajoutée avec succès",
                id: results.insertId
            });
        }
    );
};


// ==========================================
// MODIFIER UNE ACTUALITE
// PUT /api/actualites/:id
// ==========================================

const updateActualite = (req, res) => {

    const { id } = req.params;

    const {
        titre,
        contenu,
        date_publication
    } = req.body;

    const image = req.file ? req.file.filename : req.body.image;

    const sql = `
        UPDATE actualites
        SET
            titre = ?,
            contenu = ?,
            image = ?,
            date_publication = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            titre,
            contenu,
            image || null,
            date_publication,
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
                    message: "Actualité introuvable"
                });
            }

            res.status(200).json({
                message: "Actualité modifiée avec succès"
            });
        }
    );
};


// ==========================================
// SUPPRIMER UNE ACTUALITE
// DELETE /api/actualites/:id
// ==========================================

const deleteActualite = (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM actualites WHERE id = ?";

    db.query(sql, [id], (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erreur lors de la suppression"
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                message: "Actualité introuvable"
            });
        }

        res.status(200).json({
            message: "Actualité supprimée avec succès"
        });
    });
};


module.exports = {
    getAllActualites,
    getActualiteById,
    createActualite,
    updateActualite,
    deleteActualite
};