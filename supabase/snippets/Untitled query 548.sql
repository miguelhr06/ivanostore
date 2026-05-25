-- 1. Modificamos el user_id de favoritos para que sea BIGINT (entero), idéntico a tu tabla usuarios
ALTER TABLE favoritos ALTER COLUMN user_id TYPE BIGINT USING user_id::bigint;

-- 2. Modificamos el producto_id de favoritos para que sea BIGINT (entero), idéntico a tu tabla modelos
ALTER TABLE favoritos ALTER COLUMN producto_id TYPE BIGINT USING producto_id::bigint;

-- 3. Ahora que los tipos son idénticos, creamos la relación con los productos (modelos)
ALTER TABLE favoritos 
ADD CONSTRAINT favoritos_producto_id_fkey 
FOREIGN KEY (producto_id) REFERENCES modelos(id) ON DELETE CASCADE;

-- 4. Creamos la relación con los usuarios para que Supabase no proteste
ALTER TABLE favoritos 
ADD CONSTRAINT favoritos_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE;