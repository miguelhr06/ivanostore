-- 1. Eliminamos temporalmente la llave foránea que amarra la columna
ALTER TABLE favoritos DROP CONSTRAINT IF EXISTS favoritos_user_id_fkey;

-- 2. Forzamos el cambio de tipo de dato de UUID a TEXT
ALTER TABLE favoritos ALTER COLUMN user_id TYPE text USING user_id::text;