-- Agregamos la columna de contraseña si no existe
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Ponle una contraseña manual a tu usuario para probar el login
UPDATE usuarios 
SET password = 'u23261393@' 
WHERE email = 'memelito2006@gmail.com';