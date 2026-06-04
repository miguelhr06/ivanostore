const fs = require('fs');
const path = require('path');

// Esto lee las variables que configuraste en el panel de Vercel
const envContent = `
export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL || ''}',
  supabaseKey: '${process.env.SUPABASE_KEY || ''}',
  culqiPK: '${process.env.CULQI_PK || ''}',
  culqiPKLive: '${process.env.CULQI_PK_LIVE || ''}',
  firebase: {
    apiKey: "${process.env.FIREBASE_API_KEY || ''}",
    authDomain: "ivanostore.firebaseapp.com",
    projectId: "ivanostore",
    storageBucket: "ivanostore.firebasestorage.app",
    messagingSenderId: "334537530555",
    appId: "1:334537530555:web:2006790d9afbbc9954dd9e"
  }
};
`;

fs.writeFileSync(path.join(__dirname, 'src/environments/environment.prod.ts'), envContent);
console.log('Archivo environment.prod.ts generado con éxito para Vercel.');