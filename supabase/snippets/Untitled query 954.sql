-- Insertar tallas para el modelo F1000 (Niño)
INSERT INTO variantes_stock (modelo_id, talla, stock)
SELECT id, talla, 10 FROM modelos, unnest(ARRAY[27, 28, 29, 30, 31, 32]) AS talla 
WHERE modelo = 'F1000' AND sigla = 'T';

-- Insertar tallas para el modelo F2000 (Niña)
INSERT INTO variantes_stock (modelo_id, talla, stock)
SELECT id, talla, 10 FROM modelos, unnest(ARRAY[27, 28, 29, 30, 31, 32]) AS talla 
WHERE modelo = 'F2000' AND sigla = 'G';