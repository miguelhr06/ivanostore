INSERT INTO public.variantes_stock (modelo_id, talla, stock)
SELECT 
    (SELECT id FROM public.modelos WHERE modelo = 'A0075' AND color = 'OCRE' LIMIT 1) AS modelo_id,
    talla AS talla,
    100 AS stock
FROM unnest(ARRAY['S', 'M', 'L']) AS talla; -- Las 4 tallas de la web