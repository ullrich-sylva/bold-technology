const express = require("express");

const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const { uploadRealisationMedia, verifyRealFileType } = require("../middlewares/uploadMiddleware");

const {
    getAllRealisations,
    getRealisationById,
    createRealisation,
    updateRealisation,
    deleteRealisation
} = require("../controllers/realisationController");


// Récupérer toutes les réalisations (public)
router.get("/", getAllRealisations);


// Récupérer une réalisation par ID (public)
router.get("/:id", getRealisationById);


// Ajouter une réalisation (admin uniquement) — upload photo + vidéo + vérification magic bytes
router.post("/", verifyToken, uploadRealisationMedia, verifyRealFileType, createRealisation);


// Modifier une réalisation (admin uniquement)
router.put("/:id", verifyToken, uploadRealisationMedia, verifyRealFileType, updateRealisation);


// Supprimer une réalisation (admin uniquement)
router.delete("/:id", verifyToken, deleteRealisation);


module.exports = router;
