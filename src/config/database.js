const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Vérifier la connexion au démarrage
pool.getConnection((error, connection) => {
    if (error) {
        console.error("Erreur de connexion à MySQL :", error.message);
        return;
    }
    console.log("Connexion à MySQL réussie !");
    connection.release();
});

module.exports = pool;