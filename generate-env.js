const fs = require('fs');
const path = require('path');

// 1. Definir la ruta de la carpeta y el archivo
const dir = path.join(__dirname, 'src', 'environments');
const file = path.join(dir, 'environment.prod.ts');

// 2. Crear la carpeta si no existe
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// 3. Contenido del archivo
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

// 4. Escribir el archivo
fs.writeFileSync(file, envContent);
console.log('Archivo environment.prod.ts generado exitosamente.');