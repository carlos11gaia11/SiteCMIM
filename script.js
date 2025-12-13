// Importações do Firebase
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuração do Firebase (coloque as suas informações aqui)
const firebaseConfig = {
  apiKey: "AIzaSyCM1zA9NYpxG9WSb8E4k91FNp2DIvqzPEQ",
  authDomain: "login-cmim.firebaseapp.com",
  projectId: "login-cmim",
  storageBucket: "login-cmim.firebasestorage.app",
  messagingSenderId: "1003784143194",
  appId: "1:1003784143194:web:4e059a0f7f592eb3b0b363"
};

// Inicializa Firebase apenas se ainda não tiver nenhum app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Referência do container no HTML
const container = document.getElementById('jogadores-container');

// FUNÇÃO: mostrar todos os jogadores
async function mostrarJogadores() {
  container.innerHTML = ''; // limpa o container
  try {
    const querySnapshot = await getDocs(collection(db, "jogadores")); // pega todos os jogadores

    querySnapshot.forEach((docSnap) => {
      const jogador = docSnap.data();
      const div = document.createElement('div');
      div.classList.add('jogador');
      
      // Cria o HTML do jogador
      let html = `<strong>${jogador.nome}</strong><br>`;
      for (let campo in jogador) {
        if (campo !== 'nome') {
          html += `${campo}: ${jogador[campo]} | `;
        }
      }
      div.innerHTML = html;
      container.appendChild(div);
    });
  } catch (error) {
    console.error("Erro ao buscar jogadores:", error);
  }
}

// FUNÇÃO DE TESTE: verifica se a conexão com o Firebase está ok
async function testeFirebase() {
  try {
    const snapshot = await getDocs(collection(db, "jogadores"));
    console.log("🔥 Firebase conectado com sucesso! Jogadores encontrados:", snapshot.size);
  } catch (error) {
    console.error("Erro ao conectar ao Firebase:", error);
  }
}

// FUNÇÃO: adicionar um novo jogador
document.getElementById('adicionar-jogador').addEventListener('click', async () => {
  const nome = document.getElementById('novo-nome').value.trim();
  if (!nome) return alert("Digite o nome do jogador!");

  await setDoc(doc(db, "jogadores", nome), {
    nome: nome,
    pontos: 0,
    vitorias: 0,
    derrotas: 0,
    penalidades: 0,
    FinalTorneio: 0,
    bagre: 0,
    jogos: 0,
    md3: 0,
    mvp: 0,
    win_torneio: 0,
    winrate: 0
  });

  mostrarJogadores();
});

// FUNÇÃO: adicionar ou atualizar qualquer campo de um jogador
document.getElementById('adicionar-campo').addEventListener('click', async () => {
  const jogadorAlvo = document.getElementById('jogador-alvo').value.trim();
  const campoNome = document.getElementById('campo-nome').value.trim();
  const campoValor = document.getElementById('campo-valor').value.trim();

  if (!jogadorAlvo || !campoNome) return alert("Preencha jogador e campo!");

  const jogadorRef = doc(db, "jogadores", jogadorAlvo);
  await updateDoc(jogadorRef, {
    [campoNome]: campoValor
  });

  mostrarJogadores();
});

// Chama o teste e mostra jogadores quando o site carregar
testeFirebase();
mostrarJogadores();
