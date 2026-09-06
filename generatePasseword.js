const bcrypt = require("bcrypt");

const motDePasse = "admin123";

bcrypt.hash(motDePasse, 10)
    .then(hash => {
        console.log("Mot de passe :", motDePasse);
        console.log("Hash :", hash);
    })
    .catch(error => {
        console.error(error);
    });