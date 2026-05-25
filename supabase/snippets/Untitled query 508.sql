CREATE TABLE historial_compras (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id),
  producto_id BIGINT REFERENCES modelos(id),
  fecha_compra TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  monto_total DECIMAL,
  estado_pedido TEXT DEFAULT 'procesando'
);

SELECT * FROM usuarios WHERE email = 'miguelherrerarojas06@gmail.com';