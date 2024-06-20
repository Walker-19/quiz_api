const sqlite = require('sqlite3').verbose();

// Créer une nouvelle instance de la base de données SQLite
const db = new sqlite.Database('./data/Project_Management.db');

// Définition du schéma de la base de données
const createTables = () => {
    db.serialize(() => {
        // Création de la table User
        db.run(`CREATE TABLE IF NOT EXISTS user(id INTEGER PRIMARY KEY, firstname TEXT, lastname TEXT, email TEXT)`, (err) => {
            if (err) {
                console.error('Erreur lors de la création de la table user: ', err.message);
            } else {
                console.log('Table utilisateur créée avec succès');
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS quiz(id INTEGER PRIMARY KEY, titre TEXT, description TEXT)`, (err) => {
            if (err) {
                console.log('Erreur lors de la création de la table quiz: ', err.message);
            } else {
                console.log('Table quiz créer avec succés');
            }
        });
        db.run(`CREATE TABLE IF NOT EXISTS question(id INTEGER PRIMARY KEY, question TEXT, id_quiz INTEGER, FOREIGN KEY (id_quiz) REFERENCES quiz(id))`, (err) => {
            if (err) {
                console.log('Erreur lors de la création de la table question: ', err.message);
            } else {
                console.log('Table question créer avec succés');
            }
        });
        db.run(`CREATE TABLE IF NOT EXISTS response(id INTEGER PRIMARY KEY, response TEXT, correct TEXT,  id_question INTEGER, FOREIGN KEY (id_question) REFERENCES question(id))`, (err) => {
            if (err) {
                console.log('Erreur lors de la création de la table response: ', err.message);
            } else {
                console.log('Table response créer avec succés');
            }
        });
        // Fermeture de la connexion à la base de données
        db.close();
    });
};

// Exporter la fonction createTables
module.exports = createTables;
