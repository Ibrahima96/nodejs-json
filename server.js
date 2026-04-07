const express = require("express");
const fs = require("fs");
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
// Middleware pour lire JSON
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

//lire les donnée
const lireData = () => {
  const data = fs.readFileSync("data.json");
  return JSON.parse(data); // JSON.parse transformer en JSON pour le web
};

const ecrireData = (data) => {
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
};

/**
 *
 * 1. Lister les étudiants
 *
 */

app.get("/etudiants", (req, res) => {
  const data = lireData();
  res.json(data.etudiants);
});

/**
 *
 * 2. Ajouter étudiant
 *
 */

app.post("/etudiants", (req, res) => {
  const data = lireData();

  
  // Vérification
  if (!req.body.nom || typeof req.body.nom !== 'string' || req.body.nom.trim() === "") {
    return res.status(400).json({
      message: "Le nom est requis",
    });
  }

  if (!isNaN(req.body.nom)) {
    return res.status(400).json({
      message: "Le nom ne peut pas être uniquement numérique",
    });
  }

  const nouvelEtudiant = {
    id: Date.now(),
    nom: req.body.nom,
    notes: [],
  };

  // Ajouter la etudiants
  data.etudiants.push(nouvelEtudiant);

  // Sauvegarder
  ecrireData(data);

  res.json(nouvelEtudiant);
});

/**
 *
 * 3. Ajouter une note
 *
 */

app.post("/notes", (req, res) => {
  const { id, note } = req.body;

  // Vérification
  if (!id || note === undefined) {
    return res.status(400).json({
      message: "id et note sont obligatoires",
    });

  }
  if (typeof note !== "number" || note < 0 || note > 20) {
    return res.status(400).json({
      message: "La note doit être entre 0 et 20",
    });
  }
  const data = lireData();

  const etudiant = data.etudiants.find((e) => e.id == id);

  if (!etudiant) {
    return res.status(404).json({
      message: "Étudiant non trouvé",
    });
  }

  // Ajouter la note
  etudiant.notes.push(note);

  // Sauvegarder
  ecrireData(data);

  res.json({
    message: "Note ajoutée avec succès",
    etudiant: etudiant,
  });
});

/**
 *
 * 4. Afficher les notes d’un étudiant
 *
 */

app.get("/etudiants/:id/notes", (req, res) => {
  const id = req.params.id;

  const data = lireData();

  const etudiant = data.etudiants.find((e) => e.id == id);

  if (!etudiant) {
    return res.status(404).json({
      message: "Étudiant non trouvé",
    });
  }

  res.json({
    nom: etudiant.nom,
    notes: etudiant.notes,
  });
});



/**
 *
 * 5. Supprimer une note
 *
 */

app.delete("/notes", (req, res) => {
  const { id, index } = req.body;

  const data = lireData();

  const etudiant = data.etudiants.find((e) => e.id == id);

  if (!etudiant) {
    return res.status(404).json({
      message: "Étudiant non trouvé",
    });
  }

  if (index < 0 || index >= etudiant.notes.length) {
    return res.status(400).json({
      message: "Index invalide",
    });
  }

  // Supprimer la note
  etudiant.notes.splice(index, 1);

  ecrireData(data);

  res.json({
    message: "Note supprimée",
    notes: etudiant.notes,
  });
});

/**
 *
 * 6.Calcul moyenne d’un étudiant
 *
 */


app.get('/etudiants/:id/moyenne', (req, res) => {
  const id = req.params.id;

  const data = lireData();

  const etudiant = data.etudiants.find(e => e.id == id);

  if (!etudiant) {
    return res.status(404).json({
      message: "Étudiant non trouvé"
    });
  }

  const notes = etudiant.notes;

  if (notes.length === 0) {
    return res.json({
      nom: etudiant.nom,
      moyenne: 0
    });
  }

  const somme = notes.reduce((a, b) => a + b, 0);
  const moyenne = somme / notes.length;

  res.json({
    nom: etudiant.nom,
    moyenne: moyenne.toFixed(2)
  });
});


/**
 *
 * 7.Classement des étudiants
 *
 */

function calculMoyenne(notes) {
  if (notes.length === 0) return 0;

  const somme = notes.reduce((a, b) => a + b, 0);
  return somme / notes.length;
}


app.get('/classement', (req, res) => {
  const data = lireData();

  const etudiants = data.etudiants;

  // Ajouter la moyenne à chaque étudiant
  const resultat = etudiants.map(e => {
    return {
      id: e.id,
      nom: e.nom,
      moyenne: calculMoyenne(e.notes)
    };
  });

  // Trier du meilleur au moins bon
  resultat.sort((a, b) => b.moyenne - a.moyenne);

  res.json(resultat);
});



app.get('/moyenne-generale', (req, res) => {
  const data = lireData();
  const etudiants = data.etudiants;

  if (etudiants.length === 0) {
    return res.json({
      moyenne_generale: 0
    });
  }

  // Calcul des moyennes individuelles
  const moyennes = etudiants.map(e => calculMoyenne(e.notes));

  // Somme des moyennes
  const somme = moyennes.reduce((a, b) => a + b, 0);

  const moyenneGenerale = somme / moyennes.length;

  res.json({
    moyenne_generale: moyenneGenerale.toFixed(2)
  });
});


// Route principale pour la page d'accueil : renvoie le fichier index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});