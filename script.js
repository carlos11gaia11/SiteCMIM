// 🔥 IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔧 CONFIGURAÇÃO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCM1zA9NYpxG9WSb8E4k91FNp2DIvqzPEQ",
  authDomain: "login-cmim.firebaseapp.com",
  projectId: "login-cmim",
  storageBucket: "login-cmim.firebasestorage.app",
  messagingSenderId: "1003784143194",
  appId: "1:1003784143194:web:4e059a0f7f592eb3b0b363"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================
// 📌 VARIÁVEIS PRINCIPAIS
// ==========================
let state = { players: [], history: [] };
let editMode = true;

const RULES = {
  eachGame: 0.5,
  victory: 2,
  defeat: -2.5,
  md3win: 1.5,
  finalVice: 1.5,
  winTorneio: 3,
  mvp: 2,
  bagrePenalty: -3
};

// ==========================
// 📌 LOCALSTORAGE
// ==========================
function saveState() {
  localStorage.setItem('cmim_state_v1', JSON.stringify(state));
}
function loadState() {
  const raw = localStorage.getItem('cmim_state_v1');
  if (raw) state = JSON.parse(raw);
}
loadState();

// ==========================
// 📌 AUXILIARES
// ==========================
function findPlayer(name) {
  if (!name) return null;
  const n = name.trim();
  return state.players.find(p => p.name.toLowerCase() === n.toLowerCase()) || null;
}
function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeJs(s) {
  return String(s).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ==========================
// 📌 RENDERIZAÇÃO
// ==========================
function recalcPlayer(p) {
  const jogos = Number(p.jogos) || 0;
  const vitorias = Number(p.vitorias) || 0;
  const derrotas = Number(p.derrotas) || 0;
  const md3 = Number(p.md3win) || 0;
  const finalT = Number(p.finalT) || 0;
  const winT = Number(p.winT) || 0;
  const mvp = Number(p.mvpCount) || 0;
  const penal = Number(p.penalidades) || 0;
  const bagre = Number(p.bagreCount) || 0;

  let pts = 0;
  pts += jogos * RULES.eachGame;
  pts += vitorias * RULES.victory;
  pts += derrotas * RULES.defeat;
  pts += md3 * RULES.md3win;
  pts += finalT * RULES.finalVice;
  pts += winT * RULES.winTorneio;
  pts += mvp * RULES.mvp;
  pts += bagre * RULES.bagrePenalty;
  pts -= penal;

  p.pontos = Number(pts.toFixed(2));
}

function renderPlayers() {
  const tbody = document.querySelector('#playersTable tbody');
  tbody.innerHTML = '';

  const q = (document.getElementById('searchPlayer').value || '').toLowerCase();

  const list = state.players
    .filter(p => p.name.toLowerCase().includes(q))
    .sort((a, b) => b.pontos - a.pontos);

  document.getElementById('totalPlayers').innerText = list.length;

  list.forEach((p, i) => {
    p.jogos = (Number(p.vitorias) || 0) + (Number(p.derrotas) || 0);
    recalcPlayer(p);
    const pos = i + 1;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${pos}</strong></td>
      <td style="text-align:left">
        <span class="clickable" onclick="filterHistoryBy('${escapeHtml(p.name)}')">${escapeHtml(p.name)}</span>
      </td>
      <td class="puntos">${p.pontos.toFixed(2)}</td>
      <td>${p.jogos}</td>
      <td><input type="number" value="${p.vitorias}" min="0" style="width:60px"
        onchange="onPlayerFieldEdit(this,'vitorias','${escapeJs(p.name)}')"></td>
      <td><input type="number" value="${p.derrotas}" min="0" style="width:60px"
        onchange="onPlayerFieldEdit(this,'derrotas','${escapeJs(p.name)}')"></td>
      <td><input type="number" value="${p.md3win}" min="0" style="width:60px"
        onchange="onPlayerFieldEdit(this,'md3win','${escapeJs(p.name)}')"></td>
      <td><input type="number" value="${p.finalT}" min="0" style="width:60px"
        onchange="onPlayerFieldEdit(this,'finalT','${escapeJs(p.name)}')"></td>
      <td><input type="number" value="${p.winT}" min="0" style="width:60px"
        onchange="onPlayerFieldEdit(this,'winT','${escapeJs(p.name)}')"></td>
      <td class="muted-cell">${(p.jogos > 0 ? ((p.vitorias / p.jogos) * 100).toFixed(1) : '0.0')}%</td>
      <td><input type="number" value="${p.mvpCount}" min="0" style="width:60px"
        onchange="onPlayerFieldEdit(this,'mvpCount','${escapeJs(p.name)}')"></td>
      <td><input type="number" value="${p.bagreCount}" min="0" style="width:60px"
        onchange="onPlayerFieldEdit(this,'bagreCount','${escapeJs(p.name)}')"></td>
      <td><input type="number" value="${p.penalidades}" style="width:60px"
        onchange="onPlayerFieldEdit(this,'penalidades','${escapeJs(p.name)}')"></td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll("#playersTable input").forEach(i => i.disabled = !editMode);

  saveState();
}

function renderHistory() {
  const tbody = document.querySelector('#historyTable tbody');
  tbody.innerHTML = '';

  const q = (document.getElementById('historyFilter').value || '').toLowerCase();
  const list = state.history.filter(e => {
    if (!q) return true;
    return (
      e.date.toLowerCase().includes(q) ||
      e.team1.join(" ").toLowerCase().includes(q) ||
      e.team2.join(" ").toLowerCase().includes(q) ||
      e.mvp.toLowerCase().includes(q) ||
      e.bagre.toLowerCase().includes(q)
    );
  });

  list.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.date}</td>
      <td>${e.team1.join(', ')}</td>
      <td>${e.team2.join(', ')}</td>
      <td>${e.score}</td>
      <td>${e.winner}</td>
      <td>${e.mvp}</td>
      <td>${e.bagre}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================
// 📌 EDIÇÃO
// ==========================
function onPlayerFieldEdit(elem, field, name) {
  const p = findPlayer(name);
  if (!p) return;

  p[field] = Number(elem.value) || 0;
  if (field === 'vitorias' || field === 'derrotas') {
    p.jogos = (Number(p.vitorias) || 0) + (Number(p.derrotas) || 0);
  }

  if (!editMode) recalcPlayer(p);
  saveState();
}

function toggleEditMode() {
  editMode = !editMode;
  const btn = document.getElementById("toggleEditBtn");
  btn.textContent = editMode ? "Modo Edição: ON" : "Modo Edição: OFF";
  btn.classList.toggle("off", !editMode);

  document.querySelectorAll("#playersTable input").forEach(i => i.disabled = !editMode);
  document.getElementById("matchRegisterCard").style.display = editMode ? "block" : "none";
  document.getElementById("playerAddPanel").style.display = editMode ? "flex" : "none";

  if (!editMode) state.players.forEach(p => { recalcPlayer(p); });
  renderPlayers();
}

// ==========================
// 📌 CONTROLES UI
// ==========================
function uiAddPlayer() {
  const input = document.getElementById('newPlayerName');
  const name = input.value.trim();
  if (!name) return alert('Digite um nome de jogador.');
  if (findPlayer(name)) return alert('Jogador já cadastrado.');

  state.players.push({
    name, pontos: 0, jogos: 0, vitorias: 0, derrotas: 0, md3win: 0,
    finalT: 0, winT: 0, mvpCount: 0, bagreCount: 0, penalidades: 0
  });

  input.value = '';
  saveState();
  renderPlayers();
}

function clearAll() {
  if (!confirm('Tem certeza? Isso irá limpar TODOS os dados salvos.')) return;
  localStorage.removeItem('cmim_state_v1');
  state = { players: [], history: [] };
  renderPlayers();
  renderHistory();
}

function filterHistoryBy(text) {
  document.getElementById('historyFilter').value = text;
  renderHistory();
}

// ==========================
// 📌 EXPORT / IMPORT
// ==========================
function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "cmim_dados.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.players) throw new Error("Formato inválido");
      state = data;
      saveState();
      renderPlayers();
      renderHistory();
      alert("Dados importados com sucesso!");
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ==========================
// 📌 INICIALIZAÇÃO
// ==========================
renderPlayers();
renderHistory();

// ==========================
// 📌 FUNÇÃO FIREBASE: carregar jogadores do Firebase
// ==========================
async function carregarJogadoresFirebase() {
  try {
    const snapshot = await getDocs(collection(db, "jogadores"));
    state.players = []; // limpa lista
    snapshot.forEach(docSnap => {
      state.players.push(docSnap.data());
    });
    renderPlayers();
    console.log("🔥 Jogadores carregados do Firebase:", state.players.length);
  } catch (err) {
    console.error("Erro ao carregar jogadores Firebase:", err);
  }
}

// chamar ao iniciar
carregarJogadoresFirebase();
