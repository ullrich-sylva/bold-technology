const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const { fileTypeFromFile } = require("file-type");

const uploadDir = path.join(__dirname, "../../uploads");

// Types autorisés par catégorie (extension -> mimetype réel attendu)
const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/quicktime", "video/webm"];

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        // crypto.randomUUID() plutôt que Date.now() : imprévisible, pas de collision possible
        const uniqueName = crypto.randomUUID() + path.extname(file.originalname).toLowerCase();
        cb(null, uniqueName);
    }
});

// Premier filtre : rapide, basé sur l'extension déclarée (rejette tôt les cas évidents)
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov", ".webm"];

    if (!allowedExt.includes(ext)) {
        return cb(new Error("Format de fichier non autorisé."));
    }
    cb(null, true);
};

// Deux instances séparées : limites de taille différentes pour image vs vidéo
const uploadImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5 Mo, 10 fichiers max/requête
    fileFilter
});

const uploadVideo = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024, files: 3 }, // 100 Mo, 3 fichiers max/requête
    fileFilter
});

// Middleware de vérification POST-upload : lit les vrais octets du fichier
// À utiliser APRÈS upload.single()/array(), avant de répondre au client
async function verifyRealFileType(req, res, next) {
    const files = req.files ? Object.values(req.files).flat() : (req.file ? [req.file] : []);
    if (files.length === 0) return next();

    try {
        for (const file of files) {
            const detected = await fileTypeFromFile(file.path);
            const isValid =
                detected &&
                [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES].includes(detected.mime);

            if (!isValid) {
                // Fichier suspect : on le supprime immédiatement du disque
                fs.unlink(file.path, () => {});
                return res.status(400).json({
                    error: `Le fichier ${file.originalname} n'est pas un ${file.mimetype.startsWith("video") ? "fichier vidéo" : "fichier image"} valide.`
                });
            }
        }
        next();
    } catch (err) {
        next(err);
    }
}

// À ajouter à la fin de upload.js, avant module.exports

const uploadRealisationMedia = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024, files: 2 }, // 1 photo + 1 vidéo max
    fileFilter
}).fields([
    { name: "photo", maxCount: 1 },
    { name: "video", maxCount: 1 }
]);

module.exports = { uploadImage, uploadVideo, uploadRealisationMedia, verifyRealFileType };



