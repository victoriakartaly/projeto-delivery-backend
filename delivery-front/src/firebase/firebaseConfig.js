
import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDXbul10hpCUwJaAzrdUArA5Prh4d5Vpf0",
  authDomain: "delivery-projeto-5bf87.firebaseapp.com",
  projectId: "delivery-projeto-5bf87",
  storageBucket: "delivery-projeto-5bf87.firebasestorage.app",
  messagingSenderId: "323436401170",
  appId: "1:323436401170:web:aad12911cc453156903ecb"
};


const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const storage = getStorage(app);
export default app;
