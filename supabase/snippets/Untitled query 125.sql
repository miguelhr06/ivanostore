-- 1. Agregamos la columna de contraseña
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- 2. Agregamos la columna de puntos (por si no la tienes o quieres asegurar el tipo)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS puntos_ivano INTEGER DEFAULT 0;

-- 3. (Opcional) Si quieres que tu usuario actual ya tenga una clave para probar el login
UPDATE usuarios 
SET password = 'Miguel2023@' 
WHERE email = 'memelito2006@gmail.com';