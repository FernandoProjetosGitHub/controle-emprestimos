import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOjMnC1ehspsVUFVE-w732Zh-uTFuEQ1k",
  authDomain: "controle-emprestimos-e1131.firebaseapp.com",
  projectId: "controle-emprestimos-e1131",
  storageBucket: "controle-emprestimos-e1131.firebasestorage.app",
  messagingSenderId: "272482567547",
  appId: "1:272482567547:web:328e0d1458fb5fa28929de",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
