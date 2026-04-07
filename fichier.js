function showForm() {
  document.getElementById("content").innerHTML = `
    <div class="card bg-brandCard border border-white/10 text-white p-6 shadow-xl rounded-2xl w-full">
      <h2 class="text-xl font-bold mb-4 text-brandMint">Ajouter un Étudiant</h2>
      <input id="nom" placeholder="Nom étudiant" class="input bg-transparent border border-white/20 text-white placeholder-gray-400 w-full mb-4 focus:border-brandMint">
      <button onclick="addStudent()" class="btn btn-mint px-6 rounded-full border-none text-brandDark font-bold">Valider</button>
    </div>
  `;
}

async function addStudent() {
  const nom = document.getElementById("nom").value;

  await fetch("/etudiants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nom })
  });

  loadStudents();
}


async function loadStudents() {
  const res = await fetch("/etudiants");
  const data = await res.json();

  let html = "";

  data.forEach(e => {
    html += `
      <div class="card bg-brandCard border border-white/10 text-white p-5 shadow-lg rounded-2xl transition hover:border-brandMint">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><span class="text-brandMint">▶</span> ${e.nom}</h2>

        <div class="flex gap-3">
          <button class="btn btn-sm btn-outline-mint rounded-full px-4" onclick="showNotes(${e.id})">Voir Notes</button>
          <button class="btn btn-sm btn-mint rounded-full px-4 border-none text-brandDark" onclick="addNote(${e.id})">+ Nouvelle Note</button>
        </div>
      </div>
    `;
  });

  document.getElementById("content").innerHTML = html;
}


function addNote(id) {
  document.getElementById("content").innerHTML = `
    <div class="card bg-brandCard border border-white/10 text-white p-6 rounded-2xl">
      <h2 class="text-xl font-bold mb-4 text-brandMint">Ajouter une note</h2>
      <input id="note" type="number" placeholder="Saisir la note (ex: 15)" class="input bg-transparent border border-white/20 text-white placeholder-gray-400 w-full mb-4 focus:border-brandMint">
      <div class="flex gap-3">
        <button onclick="sendNote(${id})" class="btn btn-mint border-none text-brandDark font-bold rounded-full px-6">Ajouter</button>
        <button onclick="loadStudents()" class="btn btn-ghost text-white hover:bg-white/10 rounded-full px-6">Annuler</button>
      </div>
    </div>
  `;
}

async function sendNote(id) {
  const note = Number(document.getElementById("note").value);

  await fetch("/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, note })
  });

  loadStudents();
}


async function showNotes(id) {
  const res = await fetch(`/etudiants/${id}/notes`);
  const data = await res.json();

  let html = `
    <div class="card bg-brandCard border border-white/10 text-white p-6 rounded-2xl">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold"><span class="text-brandMint">Notes de</span> ${data.nom}</h2>
        <button onclick="loadStudents()" class="btn btn-sm btn-ghost text-gray-400 hover:text-white rounded-full">Retour</button>
      </div>
      <div class="grid gap-3">
  `;

  data.notes.forEach((n, index) => {
    html += `
      <div class="flex justify-between items-center bg-brandDark/50 p-3 rounded-xl border border-white/5">
        <span class="font-semibold text-lg text-white flex items-center gap-2"><span class="text-brandMint opacity-50">📝</span> ${n} <span class="text-gray-500 text-sm font-normal">/ 20</span></span>
        <button class="btn btn-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border-none" onclick="deleteNote(${id}, ${index})">Supprimer</button>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  document.getElementById("content").innerHTML = html;
}


async function deleteNote(id, index) {
  await fetch("/notes", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, index })
  });

  showNotes(id);
}

async function loadClassement() {
  const res = await fetch("/classement");
  const data = await res.json();

  let html = `
    <div class="card bg-brandCard border border-white/10 text-white p-6 rounded-2xl">
      <h2 class="text-2xl font-bold mb-6 text-brandMint flex items-center gap-2">🏆 Classement</h2>
      <div class="flex flex-col gap-3">
  `;

  data.forEach((e, index) => {
    let rankColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-brandMint';
    html += `
      <div class="flex justify-between items-center bg-brandDark/30 p-3 px-5 rounded-xl border border-white/5">
        <div class="flex items-center gap-4">
          <span class="font-black text-xl w-6 ${rankColor}">${e.rang || (index+1)}</span>
          <span class="font-bold text-lg">${e.nom}</span>
        </div>
        <span class="font-bold border border-brandMint/30 bg-brandMint/10 text-brandMint px-3 py-1 rounded-lg">${e.moyenne}</span>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  document.getElementById("content").innerHTML = html;
}

async function loadMoyenne() {
  const res = await fetch("/moyenne-generale");
  const data = await res.json();

  document.getElementById("content").innerHTML = `
    <div class="card bg-brandCard border border-white/10 text-white p-10 text-center rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
      <div class="absolute inset-0 bg-brandMint opacity-5 pointer-events-none blur-3xl rounded-full"></div>
      <h2 class="text-sm tracking-widest font-bold text-gray-400 uppercase mb-2 relative z-10">Moyenne de la Performance</h2>
      <p class="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brandMint to-emerald-300 drop-shadow-lg relative z-10">${data.moyenne_generale}</p>
    </div>
  `;
}

