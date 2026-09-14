const db = require("../config/database");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../../uploads");

// Supprime un fichier du disque sans faire planter le process si échec
const safeDelete = (filename) => {
    if (!filename) return;
    fs.unlink(path.join(uploadDir, filename), (err) => {
        if (err && err.code !== "ENOENT") console.error("Erreur suppression fichier :", err.message);
    });
};

// ==========================================
// AFFICHER TOUTES LES REALISATIONS
// ==========================================
const getAllRealisations = (req, res) => {
    const sql = "SELECT * FROM realisations ORDER BY created_at DESC";
    db.query(sql, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Erreur lors de la récupération des réalisations" });
        }
        res.status(200).json(results);
    });
};

// ==========================================
// AFFICHER UNE REALISATION PAR ID
// ==========================================
const getRealisationById = (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM realisations WHERE id = ?";
    db.query(sql, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Erreur lors de la récupération de la réalisation" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Réalisation introuvable" });
        }
        res.status(200).json(results[0]);
    });
};

// ==========================================
// AJOUTER UNE REALISATION
// ==========================================
const createRealisation = (req, res) => {
    const { titre, description, client, date_realisation } = req.body;

    // Le fichier vient de multer, jamais du body
    const photoFilename = req.files?.photo?.[0]?.filename || null;
    const videoFilename = req.files?.video?.[0]?.filename || null;

    if (!titre || !description) {
        // Si des fichiers ont déjà été écrits sur disque, on les supprime avant de rejeter
        safeDelete(photoFilename);
        safeDelete(videoFilename);
        return res.status(400).json({ message: "Le titre et la description sont obligatoires" });
    }

    const sql = `
        INSERT INTO realisations
        (titre, description, image, video, client, date_realisation)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [titre, description, photoFilename, videoFilename, client || null, date_realisation || null],
        (error, results) => {
            if (error) {
                console.error(error);
                // Échec DB : on nettoie les fichiers orphelins déjà écrits
                safeDelete(photoFilename);
                safeDelete(videoFilename);
                return res.status(500).json({ message: "Erreur lors de l'ajout de la réalisation" });
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
// ==========================================
const updateRealisation = (req, res) => {
    const { id } = req.params;
    const { titre, description, client, date_realisation } = req.body;

    const newPhoto = req.files?.photo?.[0]?.filename || null;
    const newVideo = req.files?.video?.[0]?.filename || null;

    // On récupère d'abord l'existant pour ne pas écraser un média non renvoyé
    // et pour pouvoir supprimer l'ancien fichier si un nouveau le remplace
    db.query("SELECT image, video FROM realisations WHERE id = ?", [id], (selectErr, rows) => {
        if (selectErr) {
            console.error(selectErr);
            safeDelete(newPhoto);
            safeDelete(newVideo);
            return res.status(500).json({ message: "Erreur lors de la modification" });
        }
        if (rows.length === 0) {
            safeDelete(newPhoto);
            safeDelete(newVideo);
            return res.status(404).json({ message: "Réalisation introuvable" });
        }

        const existing = rows[0];
        const finalPhoto = newPhoto || existing.image;
        const finalVideo = newVideo || existing.video;

        const sql = `
            UPDATE realisations
            SET titre = ?, description = ?, image = ?, video = ?, client = ?, date_realisation = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [titre, description, finalPhoto, finalVideo, client || null, date_realisation || null, id],
            (error, results) => {
                if (error) {
                    console.error(error);
                    safeDelete(newPhoto);
                    safeDelete(newVideo);
                    return res.status(500).json({ message: "Erreur lors de la modification" });
                }

                // Succès : si un nouveau fichier a remplacé l'ancien, on supprime l'ancien du disque
                if (newPhoto && existing.image) safeDelete(existing.image);
                if (newVideo && existing.video) safeDelete(existing.video);

                res.status(200).json({ message: "Réalisation modifiée avec succès" });
            }
        );
    });
};

// ==========================================
// SUPPRIMER UNE REALISATION
// ==========================================
const deleteRealisation = (req, res) => {
    const { id } = req.params;

    // On récupère les fichiers associés avant de supprimer la ligne, pour les effacer du disque
    db.query("SELECT image, video FROM realisations WHERE id = ?", [id], (selectErr, rows) => {
        if (selectErr) {
            console.error(selectErr);
            return res.status(500).json({ message: "Erreur lors de la suppression" });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: "Réalisation introuvable" });
        }

        const { image, video } = rows[0];

        db.query("DELETE FROM realisations WHERE id = ?", [id], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: "Erreur lors de la suppression" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Réalisation introuvable" });
            }

            // Nettoyage des fichiers physiques une fois la ligne supprimée avec succès
            safeDelete(image);
            safeDelete(video);

            res.status(200).json({ message: "Réalisation supprimée avec succès" });
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