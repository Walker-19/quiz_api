class User {

    constructor(nom, email, password, profil){
        this.nom = nom;
        this.email = email;
        this.password = password;
        this.profil = profil;
    }

    getNom(){
        return this.nom;
    }
    
    getEmail(){
        this.email;
    }
    getProfil(){
        return this.profil;
    }
}