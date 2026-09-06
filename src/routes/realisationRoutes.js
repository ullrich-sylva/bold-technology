const express = require("express");

const router = express.Router();

const {
    getAllRealisations,
    getRealisationById,
    createRealisation,
    updateRealisation,
    deleteRealisation
} = require("../controllers/realisationController");


// Récupérer toutes les réalisations
router.get("/", getAllRealisations);


// Récupérer une réalisation par ID
router.get("/:id", getRealisationById);


// Ajouter une réalisation
router.post("/", createRealisation);


// Modifier une réalisation
router.put("/:id", updateRealisation);


// Supprimer une réalisation
router.delete("/:id", deleteRealisation);


module.exports = router;