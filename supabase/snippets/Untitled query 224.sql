-- 1. Eliminamos la política de seguridad que nos está bloqueando el paso
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios favoritos" ON favoritos;

-- 2. Eliminamos la llave foránea (por si acaso quedara algún rastro)
ALTER TABLE favoritos DROP CONSTRAINT IF EXISTS favoritos_user_id_fkey;

-- 3. Forzamos el cambio de la columna user_id de UUID a TEXT de forma exitosa
ALTER TABLE favoritos ALTER COLUMN user_id TYPE text USING user_id::text;

-- 4. Volvemos a crear tu política de seguridad adaptada a la perfección para el nuevo tipo de dato
CREATE POLICY "Usuarios pueden ver sus propios favoritos" ON favoritos
  FOR ALL
  TO public
  USING (user_id = auth.uid()::text);