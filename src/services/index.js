import { initializeApp } from 'firebase/app'; // Inicializa  o APP
import { getAuth } from 'firebase/auth'; // Autentica￧￣o
import { getFirestore } from 'firebase/firestore'; // Para poder fazer a conex￣o
import { getStorage } from 'firebase/storage'; // Para poder fazer a conex￣o
// import {env} from 'dorenv'
// import { env } from "../config/env";

// credenciais
const firebaseConfig = {
  // apiKey: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  // authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  // projectId: process.env.REACT_APP_FIREBASE_PROJECTID,
  // storageBucket: process.env.REACT_APP_FIREBASE_STORAGEBUCKET,
  // messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGINGSENDERID,
  // appId: process.env.REACT_APP_FIREBASE_APPID,
  apiKey: 'AIzaSyDKppQY3GZuSj3eBkFSMQcQi5nl2FBNdGU',
  authDomain: 'imagens-63ad7.firebaseapp.com',
  projectId: 'imagens-63ad7',
  storageBucket: 'imagens-63ad7.appspot.com',
  messagingSenderId: '346371836172',
  appId: '1:346371836172:web:0469f8c69df6b846196129',
  measurementId: 'G-JBY3090JP9',
};

const firebaseApp = initializeApp(firebaseConfig); // para iniciar

const auth = getAuth(firebaseApp); // para inicializar a autentica￧￣o
const db = getFirestore(firebaseApp); // ￩  o nosso banco
const storage = getStorage(firebaseApp); // ￩  o nosso banco

export { auth, db, storage };
