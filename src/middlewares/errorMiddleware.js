// middlewares/errorMiddleware.js

// Gestion des routes non trouvées (404) — à placer juste avant le errorHandler
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        message: `Route non trouvée : ${req.method} ${req.originalUrl}`
    });
};

// Gestionnaire d'erreur centralisé — capture toute erreur passée via next(err)
// ou levée dans un middleware/contrôleur synchrone
const errorHandler = (err, req, res, next) => {
    console.error("Erreur non gérée :", err);

    // Erreurs multer (ex: fichier trop volumineux, type refusé)
    if (err.name === "MulterError") {
        return res.status(400).json({
            message: `Erreur d'upload : ${err.message}`
        });
    }

    // Erreur générée manuellement par notre fileFilter (ex: type de fichier refusé)
    if (err.message && err.message.includes("autorisé")) {
        return res.status(400).json({ message: err.message });
    }

    // En production, on ne renvoie jamais la stack trace ou le message brut au client
    const isDev = process.env.NODE_ENV !== "production";

    res.status(err.status || 500).json({
        message: isDev ? err.message : "Une erreur interne est survenue",
        ...(isDev && { stack: err.stack })
    });
};

module.exports = { notFoundHandler, errorHandler };