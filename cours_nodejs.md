# Cours de perfectionnement Node.js 🚀

Salut ! En tant que développeur senior, j'ai regardé ton code dans `server.js`. C'est un **très bon début** ! Tu as bien compris comment monter un serveur avec **Express** et comment créer des routes (API REST) pour lire, ajouter et supprimer des données.

Cependant, dans ton code actuel, tu utilises le module `fs` (File System) pour lire et écrire dans un fichier `data.json`. C'est parfait pour apprendre, mais en milieu professionnel (en production), on n'utilise jamais ça pour stocker des données dynamiques. 

Pourquoi ? 
- **Problème de concurrence** : Si deux utilisateurs ajoutent une note exactement en même temps, le fichier risque d'être corrompu ou l'une des notes sera perdue.
- **Performances** : Lire et réécrire tout un fichier JSON à chaque ajout devient extrêmement lent quand tu as beaucoup de données.

C'est là qu'interviennent les **bases de données** et les outils pour communiquer avec elles : les **ORM** (Object-Relational Mapping) et les **ODM** (Object-Document Mapping).

Voici comment on ferait évoluer ton projet avec deux technologies très populaires dans l'écosystème Node.js : **Prisma** et **Mongoose**.

---

## 1. Prisma (Le chouchou moderne pour le SQL) 🗄️

**Prisma** est un ORM. Il permet de parler à des bases de données relationnelles (PostgreSQL, MySQL, SQLite...) en utilisant du code JavaScript/TypeScript au lieu d'écrire des requêtes SQL complexes à la main. Il est ultra-sécurisé et propose une excellente auto-complétion.

### Étape A : Le Schéma (`schema.prisma`)
Avec Prisma, on définit à quoi ressemblent nos données. Voici l'équivalent de tes étudiants :

```prisma
// schema.prisma
datasource db {
  provider = "postgresql" // ou sqlite, mysql...
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Notre modèle Etudiant
model Etudiant {
  id    Int    @id @default(autoincrement())
  nom   String
  notes Note[] // Un étudiant peut avoir plusieurs notes
}

// Notre modèle Note
model Note {
  id         Int      @id @default(autoincrement())
  valeur     Float    // Ex: 15.5
  etudiantId Int
  etudiant   Etudiant @relation(fields: [etudiantId], references: [id])
}
```

### Étape B : L'utilisation dans Express
Au lieu d'utiliser `lireData()` et `ecrireData()`, on utilise le client Prisma :

```javascript
const express = require("express");
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

// 1. Lister les étudiants avec Prisma
app.get("/etudiants", async (req, res) => {
  // Prisma va chercher tous les étudiants et inclut leurs notes !
  const etudiants = await prisma.etudiant.findMany({
    include: { notes: true }
  });
  res.json(etudiants);
});

// 2. Ajouter un étudiant avec Prisma
app.post("/etudiants", async (req, res) => {
  const { nom } = req.body;
  
  const nouvelEtudiant = await prisma.etudiant.create({
    data: { nom: nom } // l'ID est généré tout seul !
  });
  
  res.json(nouvelEtudiant);
});

// 3. Ajouter une note à un étudiant
app.post("/notes", async (req, res) => {
  const { etudiantId, valeur } = req.body;

  const nouvelleNote = await prisma.note.create({
    data: {
      valeur: valeur,
      etudiantId: etudiantId
    }
  });

  res.json({ message: "Note ajoutée", note: nouvelleNote });
});
```

**Pourquoi c'est mieux ?** 
Prisma gère tout seul la sauvegarde. Pas besoin de tout réécrire. Il gère aussi les relations parfaitement (si tu supprimes un étudiant, tu peux paramétrer la suppression automatique de ses notes).

---

## 2. Mongoose (Le classique pour MongoDB / NoSQL) 🍃

MongoDB est une base de données NoSQL. Elle stocke les données sous forme de documents JSON, ce qui ressemble beaucoup à ce que tu faisais avec ton fichier `data.json` ! **Mongoose** est l'ODM qui va nous aider à structurer ces documents depuis Node.js.

### Étape A : Le Schéma Mongoose
Avec Mongoose, on structure nos données directement en JavaScript :

```javascript
const mongoose = require('mongoose');

// On se connecte à la base MongoDB
mongoose.connect('mongodb://localhost:27017/mon_ecole');

// On crée le schéma pour un Étudiant
const etudiantSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true 
  },
  notes: [{ 
    type: Number, 
    min: 0, 
    max: 20 
  }] // On intègre les notes directement, comme dans ton fichier actuel !
});

// On compile le modèle
const Etudiant = mongoose.model('Etudiant', etudiantSchema);
```

### Étape B : L'utilisation dans Express

```javascript
const express = require("express");
const app = express();
app.use(express.json());

// 1. Lister les étudiants avec Mongoose
app.get("/etudiants", async (req, res) => {
  const etudiants = await Etudiant.find(); // Récupère tout !
  res.json(etudiants);
});

// 2. Ajouter un étudiant
app.post("/etudiants", async (req, res) => {
  const { nom } = req.body;
  
  // Création et sauvegarde en une ligne
  const nouvelEtudiant = await Etudiant.create({ nom: nom, notes: [] });
  res.json(nouvelEtudiant);
});

// 3. Ajouter une note
app.post("/notes", async (req, res) => {
  const { id, note } = req.body;

  // On trouve l'étudiant, on ajoute la note dans son tableau "notes", et on sauvegarde
  const etudiant = await Etudiant.findById(id);
  
  if (!etudiant) return res.status(404).json({ message: "Étudiant non trouvé" });

  etudiant.notes.push(note);
  await etudiant.save(); // Mongo ne sauvegarde QUE cette modification, pas tout le fichier !
  
  res.json({ message: "Note ajoutée", etudiant });
});

// 6. Calculer la moyenne (côté base de données avec l'aggregation Mongo)
app.get('/etudiants/meilleurs', async (req, res) => {
    // Mongo permet de faire les calculs directement dans la base !
    // (C'est plus avancé, mais très puissant pour les classements)
});
```

---

## 🎯 Ce qu'il faut retenir (Le mot du Senior)

1. **Ton code actuel (`fs` + Express)** est la **première étape obligatoire** pour bien comprendre l'architecture web, les routes, les verbes HTTP (GET, POST, DELETE) et le format JSON. Tu as validé cette étape ✅!
2. Si tu dois construire un projet où les données ont beaucoup de relations complexes (ex: Étudiants, Professeurs, Classes, Matières), oriente-toi vers du SQL avec **Prisma**.
3. Si ton projet nécessite d'itérer très vite, de stocker des objets flexibles qui ressemblent déjà à du JSON, oriente-toi vers MongoDB avec **Mongoose**.

Continue de pratiquer ! La prochaine étape logique pour toi serait d'installer Docker ou de créer un compte MongoDB Atlas, et d'essayer de brancher l'un de ces deux outils sur ton `server.js` à la place de `fs.readFileSync`. Bon code ! 🚀
