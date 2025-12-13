import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Config do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_BUCKET.appspot.com",
  messagingSenderId: "SEU_MESSAGING_ID",
  appId: "SEU_APP_ID"
};

// Inicializar Firebase primeiro
const app = initializeApp(firebaseConfig);

// Só depois inicializa o Firestore
const db = getFirestore(app);

// Agora você pode chamar a função de teste
async function testeFirebase() {
  try {
    const snapshot = await getDocs(collection(db, "jogadores"));
    console.log("Conexão OK! Jogadores encontrados:", snapshot.size);
  } catch (error) {
    console.error("Erro ao conectar ao Firebase:", error);
  }
}

testeFirebase();
