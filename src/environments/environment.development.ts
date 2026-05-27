export const environment = {
  production: false,

  // Configuración de Supabase (Base de Datos)
  supabaseUrl: 'http://127.0.0.1:54321', 
  supabaseKey: 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
  
  // Configuración de Culqi (Pagos)
  culqiPK: 'pk_test_SBEbuY1yx6xOQn9W', 
  culqiPKLive: '',

  // Configuración de Firebase (SMS y Auth)
  firebase: {
    apiKey: "AIzaSyAHA8PVGBkxgjpgP0-QFsU7mSlZpTACrSY",
    authDomain: "ivanostore.firebaseapp.com",
    projectId: "ivanostore",
    storageBucket: "ivanostore.firebasestorage.app",
    messagingSenderId: "334537530555",
    appId: "1:334537530555:web:2006790d9afbbc9954dd9e",
    measurementId: "G-MZF14BVW25"
  }
};