UPDATE public.modelos
SET sigla = 'I'
WHERE modelo = 'F0115';

-- También para los modelos Bridge si su carpeta es 'G' o 'T'
UPDATE public.modelos SET sigla = 'G' WHERE modelo = 'F0008' AND color = 'NEGRO 2';
UPDATE public.modelos SET sigla = 'T' WHERE modelo = 'F0008' AND color = 'PLOMO';