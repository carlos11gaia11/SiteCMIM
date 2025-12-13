async function testeFirebase() {
  try {
    const snapshot = await getDocs(collection(db, "jogadores")); // pega a coleção jogadores
    console.log("Conexão OK! Jogadores encontrados:", snapshot.size);
  } catch (error) {
    console.error("Erro ao conectar ao Firebase:", error);
  }
}

testeFirebase();

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 1. Configuração do seu Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_BUCKET.appspot.com",
  messagingSenderId: "SEU_MESSAGING_ID",
  appId: "SEU_APP_ID"
};

// 2. Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// 3. Criar a referência pro Firestore
const db = getFirestore(app);
