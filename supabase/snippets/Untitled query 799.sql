
--PARA INSERTAR DATOS EN TABLA VARIANTES_STOCK

INSERT INTO public.variantes_stock (modelo_id, talla, stock)
SELECT 
    (SELECT id FROM public.modelos WHERE modelo = 'F0095' AND sigla = 'L' AND color = 'NEGRO 3' AND tamano = 'MEDIANO' LIMIT 1) AS modelo_id,
    talla AS talla,
    100 AS stock
FROM unnest(ARRAY[34, 35, 36, 37, 38]) AS talla;