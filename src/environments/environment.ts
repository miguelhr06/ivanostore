export const environment = {
  production: false,

  // Configuración de Supabase (Base de Datos)
  supabaseUrl: 'https://sknhnzavjsfqraxhyhht.supabase.co', 
  supabaseKey: 'sb_publishable_h_Tlkw-pI8d6MIXKnq9WKg__FSkYGfL',
  
  // Configuración de Culqi (Pagos)
  culqiPK: 'pk_test_SBEbuY1yx6xOQn9W', 
  culqiPKLive: 'pk_live_aa1zBgEvT9uc36Lh',

  // Configuración de Firebase (SMS y Auth)
  firebase: {
    apiKey: "AIzaSyAHA8PVGBkxgjpgP0-QFsU7mSlZpTACrSY",
    authDomain: "ivanostore.firebaseapp.com",
    projectId: "ivanostore",
    storageBucket: "ivanostore.firebasestorage.app",
    messagingSenderId: "334537530555",
    appId: "1:334537530555:web:2006790d9afbbc9954dd9e",
    measurementId: "G-4XG7MKMTTR"
  }
};