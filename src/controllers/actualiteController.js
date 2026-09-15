const db = require("../config/database");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../../uploads");

const safeDelete = (filename) => {
    if (!filename) return;
    fs.unlink(path.join(uploadDir, filename), (err) => {
        if (err && err.code !== "ENOENT") console.error("Erreur suppression fichier actualité :", err.message);
    });
};

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
    
    const image = req.file ? req.file.filename : null;

    if (!titre || !contenu || !date_publication) {
        safeDelete(image);
        return res.status(400).json({
            message: "Le titre, le contenu et la date sont obligatoires"
        });
    }

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
                safeDelete(image);

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

    if (!titre || !contenu || !date_publication) {
        if (req.file) safeDelete(req.file.filename);
        return res.status(400).json({
            message: "Le titre, le contenu et la date de publication sont obligatoires"
        });
    }

    const newImage = req.file ? req.file.filename : null;

    db.query("SELECT image FROM actualites WHERE id = ?", [id], (selectErr, rows) => {
        if (selectErr) {
            console.error(selectErr);
            safeDelete(newImage);
            return res.status(500).json({ message: "Erreur lors de la modification" });
        }
        if (rows.length === 0) {
            safeDelete(newImage);
            return res.status(404).json({ message: "Actualité introuvable" });
        }

        const existingImage = rows[0].image;
        const finalImage = newImage || existingImage;

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
                finalImage || null,
                date_publication,
                id
            ],
            (error, results) => {

                if (error) {
                    console.error(error);
                    safeDelete(newImage);

                    return res.status(500).json({
                        message: "Erreur lors de la modification"
                    });
                }

                // Si une nouvelle image a été uploadée avec succès et qu'une ancienne existait, on supprime l'ancienne
                if (newImage && existingImage) {
                    safeDelete(existingImage);
                }

                res.status(200).json({
                    message: "Actualité modifiée avec succès"
                });
            }
        );
    });
};


// ==========================================
// SUPPRIMER UNE ACTUALITE
// DELETE /api/actualites/:id
// ==========================================

const deleteActualite = (req, res) => {

    const { id } = req.params;

    db.query("SELECT image FROM actualites WHERE id = ?", [id], (selectErr, rows) => {
        if (selectErr) {
            console.error(selectErr);
            return res.status(500).json({ message: "Erreur lors de la suppression" });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: "Actualité introuvable" });
        }

        const imageToDelete = rows[0].image;

        const sql = "DELETE FROM actualites WHERE id = ?";

        db.query(sql, [id], (error, results) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    message: "Erreur lors de la suppression"
                });
            }

            // Supprimer le fichier image du disque après confirmation de la suppression en base
            if (imageToDelete) {
                safeDelete(imageToDelete);
            }

            res.status(200).json({
                message: "Actualité supprimée avec succès"
            });
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