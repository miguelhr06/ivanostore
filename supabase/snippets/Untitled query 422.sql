ALTER TABLE productos RENAME TO modelos;

ALTER TABLE modelos DROP COLUMN IF EXISTS talla;
ALTER TABLE modelos DROP COLUMN IF EXISTS stock;

ALTER TABLE modelos 
  ADD COLUMN IF NOT EXISTS sigla text UNIQUE,
  ADD COLUMN IF NOT EXISTS modelo_nombre text,
  ADD COLUMN IF NOT EXISTS descripcion text,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS categoria text,
  ADD COLUMN IF NOT EXISTS imagen_url_2 text,
  ADD COLUMN IF NOT EXISTS imagen_url_3 text,
  ADD COLUMN IF NOT EXISTS imagen_url_4 text,
  ADD COLUMN IF NOT EXISTS imagen_url_5 text;