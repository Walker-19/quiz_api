const createTables = require('./data/init_db');
const sqlite = require('sqlite3');
const express =  require('express');
const multer = require('multer');
const cors = require('cors')
const bcrypt = require('bcrypt');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/profiles/')
    },
    filename: (req, file, cb) => {
        const filename = file.originalname;
        cb(null, filename) 
    }
})

const path = require('path');

const photosDirectory = path.join(__dirname, 'uploads/profiles');

const upload = multer({storage: storage})

const app = express();

app.use(cors());

// Middleware pour parser le corps des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const port = 3001; //Port sur lequel le serveur écoutera

const db = new sqlite.Database('./data/Project_Management.db');

//Route

app.get('/', (req, res)=> {
    res.send('hello world')
});


app.post('/login', upload.none(), async (req, res) => {
    const {email, password} = await req.body;
    const Plainpassword = password;
    // console.log(email)
    if (email) {
        
        db.get("SELECT * FROM user WHERE email = ?", [email], (eror, row) => {
            if (eror) {
                console.error("Une erreur s'est produite")
            }
            else {
                if (row) {
                    const {password} = row;
                    const passwordHash = password;

                    bcrypt.compare(Plainpassword, passwordHash).then(isMatch => {
                            if (isMatch) {
                                console.log("Utilisateur authentifier");
                                res.json(row);
                            }
                            else {
                                console.log('Mot de passe incorrect');
                                res.json({message: 'Mot de passe incorrect'});
                            }
                    });
                    

                }
                else {
                    res.json({message: 'Vous n\'avez pas de compte veuillez vous inscrire'})
                }
            }
        })
        // bcrypt.compare()
    }
    
    // console.log(email, password);
    // res.send(email)
})

app.post('/register' , upload.single('avatar'),  (req, res)=> {
    const {email, firstname, lastname, password} = req.body;
    let passwordhash = "";
    let file = "";
    if (req.file) {
        file = req.file.filename;
    }
    if (email && firstname && lastname && password) {
        
        bcrypt.hash(password, 10, (err, hash)=> {
            if (!err) {
                passwordhash = hash;

                db.get("SELECT * FROM user WHERE email = ? ", [email], (error, row) => {
                    if (error) {
                        console.error("une erreur s'est produite lors de la vérification des doublons: "+ error.message)
                    }
                    else {
                        if (row) {
                            console.log("L'utilisateur existe déjà")
                            return   res.send("L'utilisateur existe déjà");
                        }
                        else {
                db.run("INSERT INTO user(firstname, lastname, email, password, profil) VALUES(?, ?, ?, ?, ?)",
                    [firstname, lastname, email, passwordhash, file],
                    (err) => {
                    if (err) {
                        console.error('erreur:', err.message)
                        return res.send("Une erreur s'est produite lors de l'enregistrement", err.message)
                    }
                    else{
                        db.get("SELECT * FROM user WHERE email = ?", [email], (err, row) => {
                            if (err) {
                                console.error(err.message)
                                res.send("Proble d'authentification")
                            }
                            else {
                                console.log('réussi')
                                res.send('OK').json(row);
                            }
                        })
                  
                    }
                    })
                        }
                    }
                })
                
                
            }
            else{
                console.error('Erreur lors du hachage du mot de passe :', err);
                return res.status(500).send("Une erreur s'est produite lors de l'enregistrement");
            }

        })
    }
    else {
        res.send("champs vide")
    }
});

app.post('/photos', (req, res) => {
    const {filename} = req.body;

    const filepath = path.join(photosDirectory, filename);

    if (filepath) {
        res.sendFile(filepath, (err) => {
            if (err) {
                console.error('Erreur lors de l\'envoi du fichier:', err);
                res.status(err.status || 500).send('Erreur lors de l\'envoi du fichier');
            } else {
                console.log('Fichier envoyé avec succès');
            }
        })
    }

})

// Ajout de du titre et de la déscription du Quiz
app.post('/addDes', upload.none() ,(req, res) => {
    const {title, description, id_user}  = req.body;
    
    console.log(title, description, id_user);
    // Vérification des doublons
    db.get("SELECT * FROM quiz WHERE id_user = ? AND titre = ? AND description = ?", [id_user, title, description],(err, row) => {
        if (err) {
                console.error(err.message)
        }
        else {
            if (row) {
                console.log("Le Quiz est déjà enregistré");
                
            }
            else {

                db.run("INSERT INTO quiz(titre, description, id_user) VALUES(?, ?, ?)", [title, description, id_user], (err) => {
                    if (err) {
                            console.error(err.message)
                    }
                    else {
                            db.get("SELECT * FROM quiz WHERE rowid = last_insert_rowid() AND id_user = ?", [id_user], (err, row) => {
                                if (err) {
                                    console.error(err.message)
                                    res.json({messsage: err.message})
                                }
                                else {
                                    console.log(row)
                                    res.json(row)
                                }
                            })  
                    }
                })
            }
        }
    })


})

app.post('/addresponse', upload.none(), (req, res) =>{
            const {question, idDes, correct, response} = req.body
            var messageS = ""
            var messageE = ""

                if (question && idDes) {
                        db.run("INSERT INTO question(question, id_quiz) VALUES(?, ?)", [question, idDes], (err)=> {
                            if (err) {
                                    console.error(err.message)
                                    messageE = "erreur lors de l'enregistrement"
                            }
                            else {
                                console.log("Question enregistré");
                                db.get("SELECT * FROM question WHERE id_quiz = ? ", [idDes], (err, row)=> {
                                    if (err) {
                                        console.error(err.message)
                                    }
                                    else {
                                        const {id, id_quiz}  = row;
                                        for (let index = 0; index < response.length; index++) {
                                            const element = response[index];
                                            
                                            db.run("INSERT INTO response(response, correct, id_question) VALUES(?, ?, ?)", [response[index], index == correct ? 1 : 0, id], (err) => {
                                                if (err) {
                                                    console.error(err.message)
                                                }
                                                else {
                                                    console.log("Question ajouté avec succées");
                                                    messageS = "Le Quiz a bien été enregistrée";
                                                }
                                            })
                                            
                                        }
                                        
                                    }
                                })
                            }
                            res.json({messege: messageS , error: messageE})  
                        })
                }

          
            
})


app.post('/email_user', (req, res) => {
    const email = req.body;
    
    db.run('SELECT * FROM user WHERE email = ?', [email], (err, row) => {
        if (err) {
            res.send('Une ereur s\'est produite: ');
        }
        else {
            if(row){
                res.json(row)

            }else{
                res.status(404).json({message: 'Utilisateur n\'existe pas'});
            }
        }
    })
})



app.listen(port, (err)=> {
    createTables();
    console.log(`Le serveur écoute sur le port ${port}`);
})

