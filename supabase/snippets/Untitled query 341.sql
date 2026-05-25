ALTER TABLE public.modelos 
ADD COLUMN sub_categoria text[];

UPDATE public.modelos 
SET sub_categoria = ARRAY['CARTERAS', 'MOCHILAS']
WHERE nombre_zapatilla LIKE '%CAMILA%';