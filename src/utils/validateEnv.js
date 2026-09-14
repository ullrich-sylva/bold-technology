const REQUIRED_ENV_VARS = [
    "DB_HOST",
    "DB_USER",
    "DB_NAME",
    "JWT_SECRET",
    "PORT"
    // DB_PASSWORD retiré de la liste stricte : une valeur vide est valide en dev local
];

function validateEnv() {
    const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error("❌ Variables d'environnement manquantes :", missing.join(", "));
        console.error("Vérifie ton fichier .env avant de redémarrer le serveur.");
        process.exit(1);
    }

    // DB_PASSWORD doit exister comme clé (même vide), mais pas être totalement absente
    if (process.env.DB_PASSWORD === undefined) {
        console.error("❌ DB_PASSWORD absent du .env (ajoute au moins DB_PASSWORD= si vide).");
        process.exit(1);
    }

    if (process.env.JWT_SECRET.length < 32) {
        console.error("❌ JWT_SECRET trop court (minimum 32 caractères recommandé pour la sécurité).");
        process.exit(1);
    }

    console.log("✅ Variables d'environnement validées.");
}

module.exports = validateEnv;