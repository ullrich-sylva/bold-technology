const multer = require("multer");
const path = require("path");

// Dossier uploads/ à la racine du projet
const uploadDir = path.join(__dirname, "../../uploads");

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Chemin absolu — fiable quel que soit le répertoire de lancement
    },
    filename: (req, file, cb) => {
        // Renommer le fichier pour éviter les doublons (ex: 1700000000000-image.jpg)
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtrer uniquement les images (JPEG, PNG, WEBP)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
        return cb(null, true);
    } else {
        cb(new Error("Seules les images (jpg, jpeg, png, webp) sont autorisées."));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5 Mo
    fileFilter: fileFilter
});

module.exports = upload;