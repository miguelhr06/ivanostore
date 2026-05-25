CREATE TABLE reclamaciones (
    id_reclamo SERIAL PRIMARY KEY,
    -- Identificación del Consumidor
    nombre_completo VARCHAR(150) NOT NULL,
    dni_ce VARCHAR(15) NOT NULL,
    celular VARCHAR(15) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    
    -- Información del Reclamo (Simplificado)
    descripcion_producto_servicio TEXT NOT NULL, -- Ej: Zapatilla Modelo 120
    detalle_reclamo_queja TEXT NOT NULL,
    
    -- Rutas de las 4 imágenes
    imagen1 VARCHAR(255),
    imagen2 VARCHAR(255),
    imagen3 VARCHAR(255),
    imagen4 VARCHAR(255),
    
    -- Control interno
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_reclamo VARCHAR(20) DEFAULT 'Pendiente'
);

ALTER TABLE reclamaciones 
  ALTER COLUMN imagen1 TYPE TEXT,
  ALTER COLUMN imagen2 TYPE TEXT,
  ALTER COLUMN imagen3 TYPE TEXT,
  ALTER COLUMN imagen4 TYPE TEXT;