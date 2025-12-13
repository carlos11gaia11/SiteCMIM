import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCM1zA9NYpxG9WSb8E4k91FNp2DIvqzPEQ",
  authDomain: "login-cmim.firebaseapp.com",
  projectId: "login-cmim",
  storageBucket: "login-cmim.firebasestorage.app",
  messagingSenderId: "1003784143194",
  appId: "1:1003784143194:web:4e059a0f7f592eb3b0b363"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// ==============================
// 🔹 Função para carregar jogadores do Firestore
// ==============================
async function carregarJogadoresFirebase() {
  const snapshot = await getDocs(collection(db, "jogadores"));
  state.players = []; // limpa os players atuais
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    state.players.push({
      name: data.nome,
      pontos: data.pontos || 0,
      jogos: data.jogos || 0,
      vitorias: data.vitorias || 0,
      derrotas: data.derrotas || 0,
      md3win: data.md3 || 0,
      finalT: data.FinalTorneio || 0,
      winT: data.win_torneio || 0,
      mvpCount: data.mvp || 0,
      bagreCount: data.bagre || 0,
      penalidades: data.penalidades || 0
    });
  });

  renderPlayers(); // atualiza a tabela
}

// ==============================
// 🔹 Função para salvar jogadores no Firebase
// ==============================
async function salvarPlayerFirebase(player) {
  if(!player || !player.name) return;
  const ref = doc(db, "jogadores", player.name);
  await setDoc(ref, {
    nome: player.name,
    pontos: player.pontos,
    jogos: player.jogos,
    vitorias: player.vitorias,
    derrotas: player.derrotas,
    md3: player.md3win,
    FinalTorneio: player.finalT,
    win_torneio: player.winT,
    mvp: player.mvpCount,
    bagre: player.bagreCount,
    penalidades: player.penalidades
  });
}

// ==============================
// 🔹 Sobrescrevendo a função saveState para também salvar no Firebase
// ==============================
async function saveState(){
  localStorage.setItem('cmim_state_v1', JSON.stringify(state));
  for(const p of state.players){
    await salvarPlayerFirebase(p);
  }
}

// ==============================
// 🔹 Inicializar
// ==============================
await carregarJogadoresFirebase();
renderPlayers();
renderHistory();
