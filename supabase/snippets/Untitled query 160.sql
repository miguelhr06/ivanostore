-- STOCK PARA LOS 5 COLORES DEL MODELO ALPHA (A0059)
INSERT INTO public.variantes_stock (modelo_id, talla, stock)
SELECT id, 'U', 100 FROM public.modelos WHERE modelo = 'A0040' AND sigla = 'B' LIMIT 1;

INSERT INTO public.variantes_stock (modelo_id, talla, stock)
SELECT id, 'U', 100 FROM public.modelos WHERE modelo = 'A0040' AND sigla = 'W' LIMIT 1;

INSERT INTO public.variantes_stock (modelo_id, talla, stock)
SELECT id, 'U', 100 FROM public.modelos WHERE modelo = 'A0040' AND sigla = 'X' LIMIT 1;

INSERT INTO public.variantes_stock (modelo_id, talla, stock)
SELECT id, 'U', 100 FROM public.modelos WHERE modelo = 'A0040' AND sigla = 'Z' LIMIT 1;
