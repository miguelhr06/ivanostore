-- 1. Asegúrate de que el RLS esté activo
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 2. Crea una política que permita SELECT a cualquier rol (anon o authenticated)
-- Esto permite que tu código de Angular consulte la tabla sin necesidad de login de Supabase.
CREATE POLICY "Acceso publico por email" 
ON usuarios 
FOR SELECT 
TO anon, authenticated
USING (true);