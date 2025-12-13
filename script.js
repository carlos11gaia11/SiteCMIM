// ==========================
// 🔥 Regras de Pontos
// ==========================
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
// 🔥 Estado inicial
// ==========================
let state = { players: [], history: [] };
let editMode = true;

// ==========================
// 🔥 Firebase
// ==========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCM1zA9NYpxG9WSb8E4k91FNp2DIvqzPEQ",
  authDomain: "login-cmim.firebaseapp.com",
  projectId: "login-cmim",
  storageBucket: "login-cmim.firebasestorage.app",
  messagingSenderId: "1003784143194",
  appId: "1:1003784143194:web:4e059a0f7f592eb3b0b363"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tabelaRef = doc(db, "tabela-insalubrinho", "pontos-insalubrinho");

// ==========================
// 🔥 Local Storage
// ==========================
function saveState() {
  localStorage.setItem('cmim_state_v1', JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem('cmim_state_v1');
  if (raw) state = JSON.parse(raw);
}

async function carregarTabela() {
  const snap = await getDoc(tabelaRef);
  if (snap.exists()) {
    const data = snap.data();
    if(data.players) state.players = data.players;
    if(data.history) state.history = data.history;
    renderPlayers();
    renderHistory();
  }
}

async function salvarTabela() {
  await setDoc(tabelaRef, state);
}

// ==========================
// 🔥 Utilitários
// ==========================
function findPlayer(name){
  if(!name) return null;
  const n = name.trim().toLowerCase();
  return state.players.find(p => p.name.toLowerCase() === n) || null;
}

function recalcPlayer(p){
  const jogos = Number(p.jogos)||0;
  const vitorias = Number(p.vitorias)||0;
  const derrotas = Number(p.derrotas)||0;
  const md3 = Number(p.md3win)||0;
  const finalT = Number(p.finalT)||0;
  const winT = Number(p.winT)||0;
  const mvp = Number(p.mvpCount)||0;
  const bagre = Number(p.bagreCount)||0;
  const penal = Number(p.penalidades)||0;

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

function escapeHtml(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function escapeJs(s){ return String(s).replace(/'/g,"\\'").replace(/"/g,'\\"'); }

// ==========================
// 🔥 Render Players
// ==========================
function renderPlayers(){
  const tbody = document.querySelector('#playersTable tbody');
  tbody.innerHTML = '';

  const q = (document.getElementById('searchPlayer').value||'').toLowerCase();

  const list = state.players
    .filter(p=>p.name.toLowerCase().includes(q))
    .sort((a,b)=>b.pontos - a.pontos);

  document.getElementById('totalPlayers').innerText = list.length;

  for(let i=0; i<list.length; i++){
    const p = list[i];
    p.jogos = (Number(p.vitorias)||0) + (Number(p.derrotas)||0);
    recalcPlayer(p);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${i+1}</strong></td>
      <td style="text-align:left"><span class="clickable" onclick="filterHistoryBy('${escapeHtml(p.name)}')">${escapeHtml(p.name)}</span></td>
      <td class="puntos">${p.pontos.toFixed(2)}</td>
      <td>${p.jogos}</td>
      <td><input type="number" value="${p.vitorias}" min="0" style="width:60px" onchange="onPlayerFieldEdit(this,'vitorias','${escapeJs(p.name)}')"></td>
      <td><input type="number" value="${p.derrotas}" min="0" style="width:60px" onchange="onPlayerFieldEdit(this,'derrotas','${escapeJs(p.name)}')"></td>
      <td><input type="number" value="${p.md3win}" min="0" style="width:60px" onchange="onPlayerFieldEdit(this,'md3win','${escapeJs(p.name)}')"></td>
      <td><input type="number" value="${p.finalT}" min="0" style="width:60px" onchange="onPlayerFieldEdit(this,'finalT','${escapeJs(p.name)}')"></td>
      <td><input type="number" value="${p.winT}" min="0" style="width:60px" onchange="onPlayerFieldEdit(this,'winT','${escapeJs(p.name)}')"></td>
      <td class="muted-cell">${(p.jogos>0?((p.vitorias/p.jogos)*100).toFixed(1):'0.0')}%</td>
      <td><input type="number" value="${p.mvpCount}" min="0" style="width:60px" onchange="onPlayerFieldEdit(this,'mvpCount','${escapeJs(p.name)}')"></td>
      <td><input type="number" value="${p.bagreCount}" min="0" style="width:60px" onchange="onPlayerFieldEdit(this,'bagreCount','${escapeJs(p.name)}')"></td>
      <td><input type="number" value="${p.penalidades}" style="width:60px" onchange="onPlayerFieldEdit(this,'penalidades','${escapeJs(p.name)}')"></td>
    `;
    tbody.appendChild(tr);
  }

  const inputs = document.querySelectorAll("#playersTable input");
  inputs.forEach(i=>i.disabled=!editMode);

  saveState();
  salvarTabela();
}

// ==========================
// 🔥 Player Edit
// ==========================
function onPlayerFieldEdit(elem, field, name){
  const p = findPlayer(name);
  if(!p) return;
  p[field] = Number(elem.value)||0;
  if(field==='vitorias'||field==='derrotas') p.jogos = (p.vitorias||0)+(p.derrotas||0);
  if(!editMode) recalcPlayer(p);
  saveState();
  salvarTabela();
}

// ==========================
// 🔥 Add Player
// ==========================
function uiAddPlayer(){
  const input = document.getElementById('newPlayerName');
  const name = input.value.trim();
  if(!name) return alert('Digite um nome de jogador.');
  if(findPlayer(name)) return alert('Jogador já cadastrado.');

  state.players.push({name,pontos:0,jogos:0,vitorias:0,derrotas:0,md3win:0,finalT:0,winT:0,mvpCount:0,bagreCount:0,penalidades:0});
  input.value='';
  renderPlayers();
}

// ==========================
// 🔥 Clear All
// ==========================
function clearAll(){
  if(!confirm('Tem certeza? Isso irá limpar TODOS os dados salvos.')) return;
  state = {players:[], history:[]};
  saveState();
  salvarTabela();
  renderPlayers();
  renderHistory();
}

// ==========================
// 🔥 Toggle Edit Mode
// ==========================
function toggleEditMode(){
  editMode = !editMode;
  const btn = document.getElementById("toggleEditBtn");
  btn.textContent = editMode ? "Modo Edição: ON" : "Modo Edição: OFF";
  btn.classList.toggle("off", !editMode);
  document.getElementById("playerAddPanel").style.display = editMode?'flex':'none';
  const inputs = document.querySelectorAll("#playersTable input");
  inputs.forEach(i=>i.disabled=!editMode);

  if(!editMode){
    state.players.forEach(p=>{p.jogos=(p.vitorias||0)+(p.derrotas||0); recalcPlayer(p)});
    renderPlayers();
  }
}

// ==========================
// 🔥 Match Functions
// ==========================
function clearMatchInputs(){
  ['t1p0','t1p1','t1p2','t1p3','t1p4','t2p0','t2p1','t2p2','t2p3','t2p4','mvpInput','bagreInput']
  .forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  document.getElementById('md3score').value='2-0';
}

function addMatch(){
  const t1=[], t2=[];
  for(let i=0;i<5;i++){
    const p1 = document.getElementById(`t1p${i}`).value.trim();
    const p2 = document.getElementById(`t2p${i}`).value.trim();
    if(p1) t1.push(p1); if(p2) t2.push(p2);
  }
  if(t1.length!==5 || t2.length!==5) return alert("Preencha os 5 jogadores de cada time.");
  const all = [...t1,...t2].map(s=>s.toLowerCase());
  const dup = all.find((v,i)=> all.indexOf(v)!==i);
  if(dup) return alert("Jogador duplicado na partida: "+dup);

  const [s1,s2] = document.getElementById('md3score').value.split('-').map(Number);
  const winnerTeam = s1>s2?1:2;
  const dateInput = document.getElementById('matchDate').value;
  const date = dateInput?new Date(dateInput):new Date();
  const dateStr = date.toLocaleDateString('pt-BR');
  const mvpName = document.getElementById('mvpInput').value.trim();
  const bagreName = document.getElementById('bagreInput').value.trim();
  if(!mvpName||!bagreName) return alert("MVP e Bagre são obrigatórios.");

  // garantir jogadores
  for(const nm of [...t1,...t2,mvpName,bagreName]){
    if(!findPlayer(nm)){
      const add = confirm(`Jogador "${nm}" não existe. Deseja adicioná-lo?`);
      if(add) state.players.push({name:nm,pontos:0,jogos:0,vitorias:0,derrotas:0,md3win:0,finalT:0,winT:0,mvpCount:0,bagreCount:0,penalidades:0});
      else return alert("Não é possível registrar a partida.");
    }
  }

  // atualizar vitórias/derrotas
  for(const nm of t1){ const p=findPlayer(nm); p.vitorias+=s1; p.derrotas+=s2; }
  for(const nm of t2){ const p=findPlayer(nm); p.vitorias+=s2; p.derrotas+=s1; }

  // MD3 win -> qualquer time com 2 vitórias
  if(s1===2 || s2===2){
    const winnerPlayers = winnerTeam===1?t1:t2;
    winnerPlayers.forEach(nm=>findPlayer(nm).md3win++);
  }

  // MVP/Bagre
  findPlayer(mvpName).mvpCount++;
  findPlayer(bagreName).bagreCount++;

  // recalc
  new Set([...t1,...t2,mvpName,bagreName]).forEach(nm=>{
    const p = findPlayer(nm); p.jogos=p.vitorias+p.derrotas; recalcPlayer(p);
  });

  // histórico
  state.history.unshift({date:dateStr,team1:t1.slice(),team2:t2.slice(),score:`${s1}x${s2}`,winner:winnerTeam===1?'Time 1':'Time 2',mvp:mvpName,bagre:bagreName});

  renderPlayers();
  renderHistory();
  clearMatchInputs();
  alert("Resultado registrado com sucesso!");
  saveState();
  salvarTabela();
}

// ==========================
// 🔥 Render History
// ==========================
function renderHistory(){
  const tbody=document.querySelector('#historyTable tbody');
  tbody.innerHTML='';
  const q=(document.getElementById('historyFilter').value||'').toLowerCase();
  const list = state.history.filter(e=>{
    if(!q) return true;
    return e.date.toLowerCase().includes(q) || e.team1.join(" ").toLowerCase().includes(q) || e.team2.join(" ").toLowerCase().includes(q) || e.mvp.toLowerCase().includes(q) || e.bagre.toLowerCase().includes(q);
  });
  for(const e of list){
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${e.date}</td><td>${e.team1.join(', ')}</td><td>${e.team2.join(', ')}</td><td>${e.score}</td><td>${e.winner}</td><td>${e.mvp}</td><td>${e.bagre}</td>`;
    tbody.appendChild(tr);
  }
}

function filterHistoryBy(text){ document.getElementById('historyFilter').value=text; renderHistory(); }

// ==========================
// 🔥 Inicializar
// ==========================
loadState();
carregarTabela();
renderPlayers();
renderHistory();
