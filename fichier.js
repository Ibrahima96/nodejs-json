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

  const res = await fetch("/etudiants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nom })
  });

  if (!res.ok) {
    const errorData = await res.json();
    showError(errorData.message || "Erreur lors de l'ajout.");
    return;
  }

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
  const inputVal = document.getElementById("note").value;
  if (inputVal === "") {
    showError("Veuillez saisir une note");
    return;
  }
  const note = Number(inputVal);

  const res = await fetch("/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, note })
  });

  if (!res.ok) {
    const errorData = await res.json();
    showError(errorData.message || "Erreur lors de l'ajout de la note.");
    return;
  }

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

// Fonction pour afficher les erreurs à l'utilisateur
function showError(message) {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    // Utilisation des classes Toast de DaisyUI
    toastContainer.className = "toast toast-top toast-center z-[100] pt-24";
    document.body.appendChild(toastContainer);
  }

  const alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-error shadow-xl text-white font-bold w-auto";
  alertDiv.innerHTML = `
    <span class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ${message}
    </span>
  `;

  toastContainer.appendChild(alertDiv);

  // Disparition automatique
  setTimeout(() => {
    alertDiv.style.opacity = "0";
    alertDiv.style.transition = "opacity 0.5s ease";
    setTimeout(() => alertDiv.remove(), 500);
  }, 3500);
}
