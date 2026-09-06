const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    // Récupérer le header Authorization
    const authHeader = req.headers["authorization"];

    // Le header doit être au format : "Bearer <TOKEN>"
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Accès refusé. Aucun token fourni."
        });
    }

    try {
        // Vérifier la validité du token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attacher les données de l'administrateur à la requête
        req.admin = decoded;

        // Passer à la suite
        next();
    } catch (error) {
        return res.status(403).json({
            message: "Token invalide ou expiré."
        });
    }
};

module.exports = verifyToken;